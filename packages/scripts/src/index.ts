import cac from 'cac';
import { blue, lightGreen } from 'kolorist';

import { version } from '../package.json';

import { cleanup, genChangelog, generateRoute, gitCommit, gitCommitVerify, release, updatePkg } from './commands';
import { loadCliOptions } from './config';
import type { Lang } from './locales';

type Command = 'changelog' | 'cleanup' | 'gen-route' | 'git-commit' | 'git-commit-verify' | 'release' | 'update-pkg';

type CommandAction<A extends object> = (args?: A) => Promise<void> | void;

type CommandWithAction<A extends object = object> = Record<Command, { action: CommandAction<A>; desc: string }>;

interface CommandArg {
  /**
   * The glob pattern of dirs to cleanup
   *
   * If not set, it will use the default value
   *
   * Multiple values use "," to separate them
   */
  cleanupDir?: string;
  /** Execute additional command after bumping and before git commit. Defaults to 'pnpm sa changelog' */
  execute?: string;
  /**
   * display lang of cli
   *
   * @default 'en-us'
   */
  lang?: Lang;
  /** Indicates whether to push the git commit and tag. Defaults to true */
  push?: boolean;
  /** Generate changelog by total tags */
  total?: boolean;
}

export async function setupCli() {
  const cliOptions = await loadCliOptions();

  const cli = cac(blue('soybean-admin'));

  cli
    .version(lightGreen(version))
    .option(
      '-e, --execute [command]',
      "Execute additional command after bumping and before git commit. Defaults to 'npx soy changelog'"
    )
    .option('-p, --push', 'Indicates whether to push the git commit and tag')
    .option('-t, --total', 'Generate changelog by total tags')
    .option(
      '-c, --cleanupDir <dir>',
      'The glob pattern of dirs to cleanup, If not set, it will use the default value, Multiple values use "," to separate them'
    )
    .option('-l, --lang <lang>', 'display lang of cli', { default: 'en-us', type: [String] })
    .help();

  const commands: CommandWithAction<CommandArg> = {
    changelog: {
      action: async args => {
        await genChangelog(cliOptions.changelogOptions, args?.total);
      },
      desc: 'generate changelog'
    },
    cleanup: {
      action: async () => {
        await cleanup(cliOptions.cleanupDirs);
      },
      desc: 'delete dirs: node_modules, dist, etc.'
    },
    'gen-route': {
      action: async () => {
        await generateRoute();
      },
      desc: 'generate route'
    },
    'git-commit': {
      action: async args => {
        await gitCommit(args?.lang);
      },
      desc: 'git commit, generate commit message which match Conventional Commits standard'
    },
    'git-commit-verify': {
      action: async () => {
        await gitCommitVerify();
      },
      desc: 'verify git commit message, make sure it match Conventional Commits standard'
    },
    release: {
      action: async args => {
        await release(args?.execute, args?.push);
      },
      desc: 'release: update version, generate changelog, commit code'
    },
    'update-pkg': {
      action: async () => {
        await updatePkg(cliOptions.ncuCommandArgs);
      },
      desc: 'update package.json dependencies versions'
    }
  };

  for (const [command, { action, desc }] of Object.entries(commands)) {
    cli.command(command, lightGreen(desc)).action(action);
  }

  cli.parse();
}

setupCli();
