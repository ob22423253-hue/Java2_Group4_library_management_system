import React from 'react';

export default function CurrentCount({ count }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <h4>📊 Current Students Inside: {count}</h4>
    </div>
  );
}
