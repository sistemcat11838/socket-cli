'use strict'

const path = require('node:path')

const {
  convertIgnorePatternToMinimatch,
  includeIgnoreFile
} = require('@eslint/compat')
const js = require('@eslint/js')
const tsParser = require('@typescript-eslint/parser')
const { createOxcImportResolver } = require('eslint-import-resolver-oxc')
const importXPlugin = require('eslint-plugin-import-x')
const nodePlugin = require('eslint-plugin-n')
const sortDestructureKeysPlugin = require('eslint-plugin-sort-destructure-keys')
const unicornPlugin = require('eslint-plugin-unicorn')
const globals = require('globals')
const tsEslint = require('typescript-eslint')

const constants = require('@socketsecurity/registry/lib/constants')
const { BIOME_JSON, GIT_IGNORE, LATEST, TSCONFIG_JSON } = constants

const { flatConfigs: origImportXFlatConfigs } = importXPlugin

const rootPath = __dirname
const rootTsConfigPath = path.join(rootPath, TSCONFIG_JSON)

const biomeConfigPath = path.join(rootPath, BIOME_JSON)
const gitignorePath = path.join(rootPath, GIT_IGNORE)

const biomeConfig = require(biomeConfigPath)

const sharedPlugins = {
  'sort-destructure-keys': sortDestructureKeysPlugin,
  unicorn: unicornPlugin
}

const sharedRules = {
  'no-await-in-loop': 'error',
  'no-control-regex': 'error',
  'no-empty': ['error', { allowEmptyCatch: true }],
  'no-new': 'error',
  'no-proto': 'error',
  'no-undef': 'error',
  'no-warning-comments': ['warn', { terms: ['fixme'] }],
  'sort-destructure-keys/sort-destructure-keys': 'error',
  'sort-imports': ['error', { ignoreDeclarationSort: true }],
  'unicorn/consistent-function-scoping': 'error'
}

const sharedRulesForImportX = {
  ...origImportXFlatConfigs.recommended.rules,
  'import-x/extensions': [
    'error',
    'never',
    {
      cjs: 'ignorePackages',
      js: 'ignorePackages',
      json: 'always',
      mjs: 'ignorePackages'
    }
  ],
  'import-x/order': [
    'warn',
    {
      groups: [
        'builtin',
        'external',
        'internal',
        ['parent', 'sibling', 'index'],
        'type'
      ],
      pathGroups: [
        {
          pattern: '@socket{registry,security}/**',
          group: 'internal'
        }
      ],
      pathGroupsExcludedImportTypes: ['type'],
      'newlines-between': 'always',
      alphabetize: {
        order: 'asc'
      }
    }
  ]
}

function getImportXFlatConfigs(isEsm) {
  return {
    recommended: {
      ...origImportXFlatConfigs.recommended,
      languageOptions: {
        ...origImportXFlatConfigs.recommended.languageOptions,
        ecmaVersion: LATEST,
        sourceType: isEsm ? 'module' : 'script'
      },
      rules: {
        ...sharedRulesForImportX,
        'import-x/no-named-as-default-member': 'off'
      }
    },
    typescript: {
      ...origImportXFlatConfigs.typescript,
      plugins: origImportXFlatConfigs.recommended.plugins,
      settings: {
        ...origImportXFlatConfigs.typescript.settings,
        'import-x/resolver-next': [
          createOxcImportResolver({
            tsConfig: {
              configFile: rootTsConfigPath,
              references: 'auto'
            }
          })
        ]
      },
      rules: {
        ...sharedRulesForImportX,
        // TypeScript compilation already ensures that named imports exist in
        // the referenced module.
        'import-x/named': 'off',
        'import-x/no-named-as-default-member': 'off',
        'import-x/no-unresolved': 'off'
      }
    }
  }
}

const importFlatConfigsForScript = getImportXFlatConfigs(false)
const importFlatConfigsForModule = getImportXFlatConfigs(true)

module.exports = [
  includeIgnoreFile(gitignorePath),
  {
    name: 'Imported biome.json ignore patterns',
    ignores: biomeConfig.files.ignore.map(convertIgnorePatternToMinimatch)
  },
  {
    files: ['**/*.{c,}js'],
    ...importFlatConfigsForScript.recommended
  },
  {
    files: ['**/*.mjs'],
    ...importFlatConfigsForModule.recommended
  },
  {
    files: ['src/**/*.ts', 'test/**/*.ts'],
    ...importFlatConfigsForModule.typescript
  },
  {
    files: ['src/**/*.ts', 'test/**/*.ts'],
    languageOptions: {
      globals: {
        BufferConstructor: 'readonly',
        BufferEncoding: 'readonly',
        NodeJS: 'readonly',
        ...Object.fromEntries(
          Object.entries(globals.node).map(([k]) => [k, 'readonly'])
        )
      },
      parser: tsParser,
      parserOptions: {
        projectService: {
          allowDefaultProject: ['test/*.ts'],
          defaultProject: 'tsconfig.json',
          tsconfigRootDir: rootPath
        }
      }
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'off'
    },
    plugins: {
      ...sharedPlugins,
      '@typescript-eslint': tsEslint.plugin
    },
    rules: {
      ...sharedRules,
      '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
      '@typescript-eslint/no-misused-new': 'error',
      '@typescript-eslint/no-this-alias': [
        'error',
        { allowDestructuring: true }
      ],
      // Returning unawaited promises in a try/catch/finally is dangerous
      // (the `catch` won't catch if the promise is rejected, and the `finally`
      // won't wait for the promise to resolve). Returning unawaited promises
      // elsewhere is probably fine, but this lint rule doesn't have a way
      // to only apply to try/catch/finally (the 'in-try-catch' option *enforces*
      // not awaiting promises *outside* of try/catch/finally, which is not what
      // we want), and it's nice to await before returning anyways, since you get
      // a slightly more comprehensive stack trace upon promise rejection.
      '@typescript-eslint/return-await': ['error', 'always']
    }
  },
  {
    files: ['test/**/*.ts'],
    rules: {
      '@typescript-eslint/no-floating-promises': 'off'
    }
  },
  {
    files: ['scripts/**/*.{c,}js', 'test/**/*.{c,}js'],
    ...nodePlugin.configs['flat/recommended-script'],
    rules: {
      ...nodePlugin.configs['flat/recommended-script'].rules,
      'n/exports-style': ['error', 'module.exports'],
      'n/no-missing-require': ['off'],
      // The n/no-unpublished-bin rule does does not support non-trivial glob
      // patterns used in package.json "files" fields. In those cases we simplify
      // the glob patterns used.
      'n/no-unpublished-bin': 'error',
      'n/no-unsupported-features/es-builtins': 'error',
      'n/no-unsupported-features/es-syntax': 'error',
      'n/no-unsupported-features/node-builtins': [
        'error',
        {
          ignores: ['test', 'test.describe'],
          // Lazily access constants.maintainedNodeVersions.
          version: constants.maintainedNodeVersions.last
        }
      ],
      'n/prefer-node-protocol': 'error',
      'no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_|^this$', ignoreRestSiblings: true }
      ]
    }
  },
  {
    files: ['scripts/**/*.{c,}js', 'test/**/*.{c,}js'],
    plugins: {
      ...sharedPlugins
    },
    rules: {
      ...js.configs.recommended.rules,
      ...sharedRules
    }
  }
]
