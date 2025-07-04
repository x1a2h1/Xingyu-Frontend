import type { Options } from '@better-scroll/core';
import BScroll from '@better-scroll/core';
import ClassNames from 'classnames';
import type { FC } from 'react';
import React from 'react';

interface Props extends React.ComponentProps<'div'> {
  /**
   * BetterScroll options
   *
   * @link https://better-scroll.github.io/docs/zh-CN/guide/base-scroll-options.html
   */
  options: Options;
  setBsScroll: (bsScroll: BScroll) => void;
}

const BetterScroll: FC<Props> = memo(({ children, className, options, setBsScroll, ...rest }) => {
  const bsWrapper = useRef<HTMLDivElement>(null);
  const bsContent = useRef<HTMLDivElement>(null);
  const bsWrapperSize = useSize(bsWrapper);
  const bsContentSize = useSize(bsContent);
  const instance = useRef<BScroll | null>(null);

  const isScrollY = Boolean(options.scrollY);

  function initBetterScroll() {
    if (!bsWrapper.current) return;
    instance.current = new BScroll(bsWrapper.current, options);

    setBsScroll(instance.current);
  }

  useUpdateEffect(() => {
    instance.current?.refresh();
  }, [bsWrapperSize?.width, bsContentSize?.width]);

  useMount(() => {
    initBetterScroll();
  });

  return (
    <div
      ref={bsWrapper}
      {...rest}
      className={ClassNames('h-full text-left', className)}
    >
      <div
        className={ClassNames('inline-block', { 'h-full': !isScrollY })}
        ref={bsContent}
      >
        {children}
      </div>
    </div>
  );
});

export default BetterScroll;
