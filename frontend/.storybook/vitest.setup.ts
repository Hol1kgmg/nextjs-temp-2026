import * as a11yAddon from '@storybook/addon-a11y/preview';
import { setProjectAnnotations } from '@storybook/nextjs-vite';
import { beforeAll } from 'vitest';

import preview from './preview';

const annotations = setProjectAnnotations([a11yAddon, preview.composed]);

// Run Storybook's beforeAll hook
beforeAll(annotations.beforeAll);
