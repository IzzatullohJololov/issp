<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::query()->firstOrCreate(
            ['email' => 'admin@issp.local'],
            [
                'name' => 'Администратор',
                'password' => 'password',
                'role' => User::ROLE_ADMIN,
                'is_active' => true,
                'position' => 'Администратор сайта',
            ],
        );

        User::query()->firstOrCreate(
            ['email' => 'editor@issp.local'],
            [
                'name' => 'Редактор',
                'password' => 'password',
                'role' => User::ROLE_EDITOR,
                'is_active' => true,
                'position' => 'Пресс-служба',
            ],
        );

        $this->call([
            SettingSeeder::class,
            MenuSeeder::class,
            StructureSeeder::class,
            ContentSeeder::class,
        ]);
    }
}
