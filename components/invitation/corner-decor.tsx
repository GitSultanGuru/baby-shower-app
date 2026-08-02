import Image from 'next/image'

type Corner = 'tl' | 'tr' | 'bl' | 'br'

const TRANSFORMS: Record<Corner, string> = {
  // Source art has the floral spray in the TOP-RIGHT quadrant.
  tr: 'none',
  tl: 'scaleX(-1)',
  br: 'scaleY(-1)',
  bl: 'rotate(180deg)',
}

const POSITIONS: Record<Corner, string> = {
  tl: 'top-0 left-0',
  tr: 'top-0 right-0',
  bl: 'bottom-0 left-0',
  br: 'bottom-0 right-0',
}

/**
 * A transparent floral corner flourish. Sits inside a `relative` card.
 */
export function CornerDecor({
  corner,
  className = '',
}: {
  corner: Corner
  className?: string
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute ${POSITIONS[corner]} z-0 h-36 w-36 opacity-60 sm:h-44 sm:w-44 ${className}`}
      style={{ transform: TRANSFORMS[corner] }}
    >
      <Image
        src="/images/floral-corner-alpha.png"
        alt=""
        fill
        sizes="180px"
        className="object-contain"
      />
    </div>
  )
}
