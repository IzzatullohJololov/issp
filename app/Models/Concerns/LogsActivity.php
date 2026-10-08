<?php

namespace App\Models\Concerns;

use App\Models\ActivityLog;
use Illuminate\Database\Eloquent\Model;

trait LogsActivity
{
    public static function bootLogsActivity(): void
    {
        static::created(function (Model $model) {
            if (auth()->check()) {
                ActivityLog::record('created', $model);
            }
        });
        static::updated(function (Model $model) {
            if (! auth()->check()) {
                return;
            }

            $changes = array_keys($model->getChanges());
            $changes = array_values(array_diff($changes, ['updated_at', 'views']));

            if ($changes === []) {
                return;
            }

            ActivityLog::record('updated', $model, ['changed' => $changes]);
        });
        static::deleted(function (Model $model) {
            if (! auth()->check()) {
                return;
            }

            $action = method_exists($model, 'isForceDeleting') && ! $model->isForceDeleting()
                ? 'trashed'
                : 'deleted';
            ActivityLog::record($action, $model);
        });

        if (method_exists(static::class, 'restored')) {
            static::restored(function (Model $model) {
                if (auth()->check()) {
                    ActivityLog::record('restored', $model);
                }
            });
        }
    }

    public function activityLabel(): string
    {
        foreach (['title', 'name', 'full_name', 'subject', 'file_name', 'email'] as $attribute) {
            $value = $this->getAttribute($attribute);

            if (is_array($value)) {
                $value = $value['ru'] ?? $value['en'] ?? reset($value);
            }

            if (filled($value)) {
                return (string) $value;
            }
        }

        return class_basename($this).' #'.$this->getKey();
    }
}
