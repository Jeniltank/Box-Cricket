'use client';

import { memo, useEffect, useState } from 'react';

const EVENT_MAP = {
  SIX: { text: 'SIX!', className: 'event-six' },
  FOUR: { text: 'FOUR!', className: 'event-four' },
  WICKET: { text: 'OUT!', className: 'event-wicket' },
  NOTOUT: { text: 'NOT OUT!', className: 'event-notout' },
  WIDE: { text: 'WIDE!', className: 'event-wide' },
  NOBALL: { text: 'FREE HIT!', className: 'event-noball' },
  INNINGS_COMPLETE: { text: '1ST INNINGS COMPLETE!', className: 'event-six' },
};

function EventOverlay({ activeEvent }) {
  const [visible, setVisible] = useState(false);
  const [event, setEvent] = useState(null);

  useEffect(() => {
    if (activeEvent && EVENT_MAP[activeEvent]) {
      setEvent(EVENT_MAP[activeEvent]);
      // Trigger reflow for animation restart
      setVisible(false);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setVisible(true);
        });
      });
    } else {
      setVisible(false);
    }
  }, [activeEvent]);

  if (!event) return null;

  return (
    <div className={`event-overlay ${visible ? 'active' : ''}`}>
      <div className={`event-text ${event.className}`}>{event.text}</div>
    </div>
  );
}

export default memo(EventOverlay);
