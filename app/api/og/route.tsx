import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0f172a',
          backgroundImage: 'linear-gradient(45deg, #0f172a 0%, #1e293b 100%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              backgroundColor: '#22c55e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 30,
            }}
          >
            <div
              style={{
                fontSize: 60,
                color: 'white',
              }}
            >
              🌱
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <h1
              style={{
                fontSize: 72,
                fontWeight: 'bold',
                color: 'white',
                margin: 0,
                lineHeight: 1,
              }}
            >
              ForestFocus
            </h1>
            <p
              style={{
                fontSize: 24,
                color: '#94a3b8',
                margin: 0,
                marginTop: 10,
              }}
            >
              Grow your focus, grow your forest
            </p>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            marginTop: 20,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              padding: '12px 20px',
              borderRadius: 25,
              border: '2px solid #22c55e',
            }}
          >
            <span style={{ fontSize: 20 }}>🍃</span>
            <span style={{ color: '#22c55e', fontSize: 18, fontWeight: 600 }}>Pomodoro Timer</span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              padding: '12px 20px',
              borderRadius: 25,
              border: '2px solid #22c55e',
            }}
          >
            <span style={{ fontSize: 20 }}>🌳</span>
            <span style={{ color: '#22c55e', fontSize: 18, fontWeight: 600 }}>Virtual Forest</span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              padding: '12px 20px',
              borderRadius: 25,
              border: '2px solid #22c55e',
            }}
          >
            <span style={{ fontSize: 20 }}>⚡</span>
            <span style={{ color: '#22c55e', fontSize: 18, fontWeight: 600 }}>Base Network</span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}