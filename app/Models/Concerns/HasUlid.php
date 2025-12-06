<?php

namespace App\Models\Concerns;

use Illuminate\Support\Str;

trait HasUlid
{
  protected static function bootHasUlid(): void
  {
    static::creating(function ($model) {
      if ($model->exists) {
        return;
      }

      if (empty($model->ulid)) {
        $model->ulid = (string) Str::ulid();
      }
    });
  }
}
