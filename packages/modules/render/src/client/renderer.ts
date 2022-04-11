import { createElement } from 'react';
import { useIsomorphicLayoutEffect } from '@tinkoff/react-hooks';
import type { FC } from 'react';
import type { Renderer } from './types';

let hydrateRoot;

try {
  // eslint-disable-next-line import/no-unresolved, import/extensions
  hydrateRoot = require('react-dom/client').hydrateRoot;
} catch {}

const ExecuteRenderCallback: FC<{ callback: () => void }> = ({ children, callback }) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useIsomorphicLayoutEffect(callback, []);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return children as any;
};

const renderer: Renderer = ({ element, container, callback, log }) => {
  if (process.env.__TRAMVAI_CONCURRENT_FEATURES !== 'false' && typeof hydrateRoot === 'function') {
    const wrappedElement = createElement(ExecuteRenderCallback, { callback }, element);

    return hydrateRoot(container, wrappedElement, {
      onRecoverableError: (error) => {
        log.error({
          error,
          event: 'hydrate:recover-after-error',
        });
      },
    });
  }
  const { hydrate } = require('react-dom');
  return hydrate(element, container, callback);
};

export { renderer };
