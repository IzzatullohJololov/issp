<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Media;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class MediaController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Media::query()->with('uploader:id,name')->latest();

        if ($folder = $request->input('folder')) {
            $query->where('folder', $folder);
        }

        if ($type = $request->input('type')) {
            $type === 'image'
                ? $query->where('mime_type', 'like', 'image/%')
                : $query->where('mime_type', 'not like', 'image/%');
        }

        if ($search = trim((string) $request->input('search'))) {
            $query->where(fn ($q) => $q->where('file_name', 'like', "%{$search}%")->orWhere('alt', 'like', "%{$search}%"));
        }

        return Inertia::render('admin/media/index', [
            'items' => $query->paginate(36)->withQueryString()->through(fn (Media $media) => $this->transform($media)),
            'folders' => Media::query()->select('folder')->distinct()->orderBy('folder')->pluck('folder'),
            'query' => $request->only(['folder', 'type', 'search']),
            'totalSize' => (int) Media::query()->sum('size'),
        ]);
    }

    public function store(Request $request): RedirectResponse|JsonResponse
    {
        $request->validate([
            'files' => ['required', 'array', 'max:20'],
            'files.*' => ['file', 'max:40960', 'mimes:jpg,jpeg,png,gif,webp,svg,pdf,doc,docx,xls,xlsx,ppt,pptx,zip,txt,mp4'],
            'folder' => ['nullable', 'string', 'max:100', 'regex:/^[a-z0-9\-_]+$/'],
        ]);

        $folder = $request->input('folder') ?: 'general';
        $created = [];

        /** @var UploadedFile $file */
        foreach ($request->file('files', []) as $file) {
            $created[] = $this->transform($this->storeFile($file, $folder));
        }

        if ($request->wantsJson()) {
            return response()->json(['files' => $created]);
        }

        return back()->with('success', 'Загружено файлов: '.count($created).'.');
    }

    public function update(Request $request, Media $media): RedirectResponse
    {
        $data = $request->validate([
            'alt' => ['nullable', 'string', 'max:255'],
            'folder' => ['nullable', 'string', 'max:100', 'regex:/^[a-z0-9\-_]+$/'],
        ]);

        $media->update(['alt' => $data['alt'] ?? null, 'folder' => $data['folder'] ?: $media->folder]);

        return back()->with('success', 'Файл обновлён.');
    }

    public function destroy(Media $media): RedirectResponse
    {
        ActivityLog::record('deleted', $media, description: $media->file_name);
        $media->delete();

        return back()->with('success', 'Файл удалён.');
    }

    public function bulkDestroy(Request $request): RedirectResponse
    {
        $data = $request->validate(['ids' => ['required', 'array'], 'ids.*' => ['integer']]);

        Media::query()->whereKey($data['ids'])->get()->each->delete();

        return back()->with('success', 'Удалено файлов: '.count($data['ids']).'.');
    }

    public function storeFile(UploadedFile $file, string $folder): Media
    {
        $extension = strtolower($file->getClientOriginalExtension() ?: $file->extension());
        $base = Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) ?: 'file';
        $path = $file->storeAs('media/'.$folder, $base.'-'.Str::lower(Str::random(6)).'.'.$extension, 'public');

        [$width, $height] = [null, null];

        if (str_starts_with((string) $file->getMimeType(), 'image/') && $extension !== 'svg') {
            $size = @getimagesize($file->getRealPath());
            if ($size) {
                [$width, $height] = [$size[0], $size[1]];
            }
        }

        $media = Media::query()->create([
            'disk' => 'public',
            'path' => $path,
            'file_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
            'width' => $width,
            'height' => $height,
            'folder' => $folder,
            'uploaded_by' => auth()->id(),
        ]);

        ActivityLog::record('uploaded', $media, description: $media->file_name);

        return $media;
    }

    /**
     * @return array<string, mixed>
     */
    protected function transform(Media $media): array
    {
        return [
            'id' => $media->id,
            'url' => $media->url(),
            'file_name' => $media->file_name,
            'mime_type' => $media->mime_type,
            'is_image' => $media->isImage(),
            'size' => $media->size,
            'width' => $media->width,
            'height' => $media->height,
            'alt' => $media->alt,
            'folder' => $media->folder,
            'uploader' => $media->uploader?->name,
            'created_at' => $media->created_at?->toIso8601String(),
        ];
    }
}
