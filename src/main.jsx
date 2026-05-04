import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { RotateCcw, Ruler, AlertCircle } from 'lucide-react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import './styles.css';

function getTrachealSize(tw) {
  if (!Number.isFinite(tw)) return null;
  if (tw >= 18) return 41;
  if (tw >= 16) return 39;
  if (tw >= 15) return 37;
  if (tw >= 14) return 35;
  if (tw >= 12.5) return 32;
  if (tw >= 11) return 28;
  return null;
}

function getBronchialSize(bd) {
  if (!Number.isFinite(bd)) return null;
  if (bd >= 12) return 41;
  if (bd >= 11) return 37;
  if (bd >= 10) return 35;
  if (bd > 0 && bd < 10) return 32;
  return null;
}

function App() {
  const [trachealWidth, setTrachealWidth] = useState('');
  const [bronchialDiameter, setBronchialDiameter] = useState('');

  const result = useMemo(() => {
    const tw = Number.parseFloat(trachealWidth);
    const bd = Number.parseFloat(bronchialDiameter);

    const hasTW = trachealWidth !== '' && Number.isFinite(tw);
    const hasBD = bronchialDiameter !== '' && Number.isFinite(bd);

    const byTrachea = hasTW ? getTrachealSize(tw) : null;
    const byBronchus = hasBD ? getBronchialSize(bd) : null;

    let recommendation = null;
    let message = '';
    let warning = '';

    if (byTrachea && byBronchus) {
      recommendation = Math.min(byTrachea, byBronchus);
      if (byTrachea === byBronchus) {
        message = `Both measurements suggest ${recommendation} Fr.`;
      } else {
        warning = `CXR suggests ${byTrachea} Fr and CT bronchus suggests ${byBronchus} Fr. Conservative recommendation: ${recommendation} Fr.`;
      }
    } else if (byTrachea) {
      recommendation = byTrachea;
      message = `Recommendation based on tracheal width: ${recommendation} Fr.`;
    } else if (byBronchus) {
      recommendation = byBronchus;
      message = `Recommendation based on bronchial diameter: ${recommendation} Fr.`;
    } else if (trachealWidth || bronchialDiameter) {
      warning = 'Measurement is outside the investigated range from the table.';
    }

    return { byTrachea, byBronchus, recommendation, message, warning };
  }, [trachealWidth, bronchialDiameter]);

  const rows = [
    ['≥18', '≥12', '41 Fr'],
    ['≥16', '12', '39 Fr'],
    ['≥15', '11', '37 Fr'],
    ['≥14', '10', '35 Fr'],
    ['≥12.5', '<10', '32 Fr'],
    ['≥11', 'N/A', '28 Fr'],
    ['N/A', 'N/A', '26 Fr'],
  ];

  return (
    <>
      <SpeedInsights />
      <main className="page">
        <section className="hero">
          <div className="pill"><Ruler size={16} /> Left-sided DLT sizing aid</div>
          <h1>DLT Size Calculator</h1>
          <p>Enter tracheal width from CXR and/or bronchial diameter from CT. The calculator reproduces the table-based left-sided DLT size recommendation.</p>
        </section>

      <section className="grid">
        <div className="card">
          <h2>Measurements</h2>
          <p className="muted">Use millimeters. You can enter one or both measurements.</p>

          <label>
            <span>Measured tracheal width on CXR</span>
            <div className="inputRow">
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.1"
                placeholder="e.g., 16"
                value={trachealWidth}
                onChange={(e) => setTrachealWidth(e.target.value)}
              />
              <strong>mm</strong>
            </div>
          </label>

          <label>
            <span>Measured bronchial diameter on CT</span>
            <div className="inputRow">
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.1"
                placeholder="e.g., 11"
                value={bronchialDiameter}
                onChange={(e) => setBronchialDiameter(e.target.value)}
              />
              <strong>mm</strong>
            </div>
          </label>

          <button onClick={() => { setTrachealWidth(''); setBronchialDiameter(''); }}>
            <RotateCcw size={16} /> Reset
          </button>
        </div>

        <div className="card resultCard">
          <h2>Recommended size</h2>

          {result.recommendation ? (
            <div className="result">
              <div className="small">Left-sided DLT</div>
              <div className="number">{result.recommendation}</div>
              <div className="french">French</div>
            </div>
          ) : (
            <div className="empty">Enter a valid measurement to generate a recommendation.</div>
          )}

          <div className="badges">
            {result.byTrachea && <span>CXR: {result.byTrachea} Fr</span>}
            {result.byBronchus && <span>CT bronchus: {result.byBronchus} Fr</span>}
          </div>

          {result.message && <p className="message">{result.message}</p>}

          {result.warning && (
            <div className="warning">
              <AlertCircle size={18} />
              <p>{result.warning}</p>
            </div>
          )}

          <p className="finePrint">Final tube selection should still account for anatomy, device brand, surgical plan, and bronchoscopic confirmation.</p>
        </div>
      </section>

      <section className="card tableCard">
        <h2>Reference table</h2>
        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Tracheal width, mm</th>
                <th>Bronchial diameter, mm</th>
                <th>Left-sided DLT</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.join('-')}>
                  <td>{row[0]}</td>
                  <td>{row[1]}</td>
                  <td><strong>{row[2]}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
