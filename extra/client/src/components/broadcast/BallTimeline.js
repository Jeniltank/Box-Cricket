'use client';

import { memo } from 'react';
import { getBallClass } from '@/utils/cricket';

function BallTimeline({ lastBalls }) {
  return (
    <div className="balls-timeline" id="last-balls">
      {(lastBalls || []).map((ball, i) => (
        <span key={i} className={getBallClass(ball)}>
          {ball}
        </span>
      ))}
    </div>
  );
}

export default memo(BallTimeline);
