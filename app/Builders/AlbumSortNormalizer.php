<?php

namespace App\Builders;

class AlbumSortNormalizer {
    public const COLUMNS_MAP = [
        'name' => 'albums.name',
        'year' => 'albums.year',
        'created_at' => 'albums.created_at',
        'artist_name' => 'artists.name',
    ];

    public static function normalize(string $column): string {
        return self::COLUMNS_MAP[$column] ?? $column;
    }

    public static function getValidColumns(): array {
        return array_values(self::COLUMNS_MAP);
    }
}


