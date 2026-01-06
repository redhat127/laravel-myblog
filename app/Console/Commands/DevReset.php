<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\App;

class DevReset extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'devreset';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Reset the local development environment (migrate:fresh --seed, optimize:clear)';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        if (! App::environment('local')) {
            $this->error('The dev:reset command can only be run in the local environment.');

            return self::FAILURE;
        }

        $this->info('Refreshing database (migrate:fresh --seed)...');
        $this->call('migrate:fresh', [
            '--seed' => true,
        ]);

        $this->info('Clearing caches (optimize:clear)...');
        $this->call('optimize:clear');

        $this->info('Local development environment has been reset.');

        return self::SUCCESS;
    }
}
