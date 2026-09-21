// App.jsx
// React single-file Lineup Builder — Colored pitch, draggable shirts with numbers, formations: 4-3-3, 3-4-3, 2-1-3-4
// Drop this into a Vite+React project (src/App.jsx). Tailwind suggested but plain CSS included.

import React, { useEffect, useState } from 'react'

const SAMPLE_PLAYERS = [
  { id: 'p1', name: 'Arif', number: 7, color: '#1f2937' },
  { id: 'p2', name: 'Khaled', number: 4, color: '#ef4444' },
  { id: 'p3', name: 'Rashed', number: 9, color: '#06b6d4' },
  { id: 'p4', name: 'Sajid', number: 11, color: '#10b981' },
  { id: 'p5', name: 'Hassan', number: 2, color: '#8b5cf6' },
  { id: 'p6', name: 'Imran', number: 6, color: '#f59e0b' },
  { id: 'p7', name: 'Mahmud', number: 5, color: '#ef4444' },
  { id: 'p8', name: 'Raihan', number: 8, color: '#1f2937' },
  { id: 'p9', name: 'Tanvir', number: 10, color: '#06b6d4' },
  { id: 'p10', name: 'Fahim', number: 3, color: '#10b981' },
  { id: 'p11', name: 'Bilal', number: 1, color: '#8b5cf6' },
  { id: 'p12', name: 'Shafiq', number: 12, color: '#f59e0b' },
  { id: 'p13', name: 'Nur', number: 13, color: '#ef4444' },
  { id: 'p14', name: 'Salim', number: 14, color: '#1f2937' },
  { id: 'p15', name: 'Ibrahim', number: 15, color: '#06b6d4' },
]

// Formation templates: each formation defines named positions and their normalized (x,y) coords on the pitch (0..1)
const FORMATIONS = {
  '4-3-3': [
    { key: 'GK', x: 0.5, y: 0.95 },
    { key: 'LB', x: 0.15, y: 0.75 },
    { key: 'LCB', x: 0.35, y: 0.78 },
    { key: 'RCB', x: 0.65, y: 0.78 },
    { key: 'RB', x: 0.85, y: 0.75 },
    { key: 'LM', x: 0.2, y: 0.5 },
    { key: 'CM', x: 0.5, y: 0.55 },
    { key: 'RM', x: 0.8, y: 0.5 },
    { key: 'LW', x: 0.2, y: 0.2 },
    { key: 'ST', x: 0.5, y: 0.18 },
    { key: 'RW', x: 0.8, y: 0.2 },
  ],
  '3-4-3': [
    { key: 'GK', x: 0.5, y: 0.95 },
    { key: 'LCB', x: 0.25, y: 0.78 },
    { key: 'CB', x: 0.5, y: 0.78 },
    { key: 'RCB', x: 0.75, y: 0.78 },
    { key: 'LM', x: 0.18, y: 0.55 },
    { key: 'LCM', x: 0.4, y: 0.55 },
    { key: 'RCM', x: 0.6, y: 0.55 },
    { key: 'RM', x: 0.82, y: 0.55 },
    { key: 'LW', x: 0.18, y: 0.18 },
    { key: 'ST', x: 0.5, y: 0.18 },
    { key: 'RW', x: 0.82, y: 0.18 },
  ],
  '2-1-3-4': [
    // a non-standard layout the user requested — interpreted as GK + 2 at back, +1 DM, +3 midfield, +4 attack
    { key: 'GK', x: 0.5, y: 0.95 },
    { key: 'LB', x: 0.3, y: 0.8 },
    { key: 'RB', x: 0.7, y: 0.8 },
    { key: 'CDM', x: 0.5, y: 0.65 },
    { key: 'LM', x: 0.2, y: 0.45 },
    { key: 'CM', x: 0.5, y: 0.45 },
    { key: 'RM', x: 0.8, y: 0.45 },
    { key: 'LW', x: 0.15, y: 0.18 },
    { key: 'ST1', x: 0.4, y: 0.18 },
    { key: 'ST2', x: 0.6, y: 0.18 },
    { key: 'RW', x: 0.85, y: 0.18 },
  ],
}

function Shirt({ player }) {
  if (!player) return null
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{
        width: 56,
        height: 64,
        borderRadius: 8,
        background: player.color || '#1f2937',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 700,
        boxShadow: '0 3px 8px rgba(0,0,0,0.25)'
      }}>
        <div style={{ textAlign: 'center' }}>{player.number}</div>
      </div>
      <div style={{ fontSize: 12, fontWeight: 600 }}>{player.name}</div>
    </div>
  )
}

export default function App() {
  const [players, setPlayers] = useState(() => {
    const raw = localStorage.getItem('lryfc_players_v2')
    return raw ? JSON.parse(raw) : SAMPLE_PLAYERS
  })
  const [formation, setFormation] = useState(() => localStorage.getItem('lryfc_formation') || '4-3-3')
  const [assignment, setAssignment] = useState(() => {
    const raw = localStorage.getItem('lryfc_assignment_v2')
    return raw ? JSON.parse(raw) : {}
  })

  useEffect(() => localStorage.setItem('lryfc_players_v2', JSON.stringify(players)), [players])
  useEffect(() => localStorage.setItem('lryfc_assignment_v2', JSON.stringify(assignment)), [assignment])
  useEffect(() => localStorage.setItem('lryfc_formation', formation), [formation])

  function onDragStart(e, playerId) {
    e.dataTransfer.setData('text/plain', playerId)
  }

  function onDropToPos(e, posKey) {
    e.preventDefault()
    const playerId = e.dataTransfer.getData('text/plain')
    if (!playerId) return
    // set assignment[posKey] = player
    setAssignment((s) => {
      // remove player from any other position first
      const copy = { ...s }
      for (const k of Object.keys(copy)) if (copy[k] === playerId) delete copy[k]
      copy[posKey] = playerId
      return copy
    })
  }

  function onUnassign(playerId) {
    setAssignment((s) => {
      const copy = { ...s }
      for (const k of Object.keys(copy)) if (copy[k] === playerId) delete copy[k]
      return copy
    })
  }

  function renderPitch() {
    const template = FORMATIONS[formation]
    return (
      <div style={{ position: 'relative', width: '100%', height: '720px', background: 'linear-gradient(180deg,#16a34a 0%, #059669 100%)', borderRadius: 12, padding: 18, boxSizing: 'border-box', boxShadow: '0 8px 30px rgba(2,6,23,0.35)'}}>
        {/* pitch markings */}
        <div style={{ position: 'absolute', inset: 18, borderRadius: 8, background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))' }} />

        {template.map((pos) => {
          const left = `${pos.x * 100}%`
          const top = `${pos.y * 100}%`
          const assignedId = assignment[pos.key]
          const player = players.find((p) => p.id === assignedId)
          return (
            <div
              key={pos.key}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => onDropToPos(e, pos.key)}
              style={{
                position: 'absolute',
                transform: 'translate(-50%, -50%)',
                left,
                top,
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: 12, color: '#ecfdf5', fontWeight: 700, marginBottom: 6 }}>{pos.key}</div>
              <div style={{ width: 64, height: 74, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                {player ? (
                  <div draggable onDragStart={(e) => onDragStart(e, player.id)} onDoubleClick={() => onUnassign(player.id)}>
                    <Shirt player={player} />
                  </div>
                ) : (
                  <div style={{ width: 56, height: 64, borderRadius: 8, border: '2px dashed rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.7)' }}>
                    +
                  </div>
                )}
              </div>
            </div>
          )
        })}

      </div>
    )
  }

  const assignedIds = new Set(Object.values(assignment))
  const unassigned = players.filter((p) => !assignedIds.has(p.id))

  function addPlayer(name) {
    const id = 'p' + Math.random().toString(36).slice(2,8)
    setPlayers((s) => [...s, { id, name, number: 99, color: '#1f2937' }])
  }

  function updatePlayer(id, data) {
    setPlayers((s) => s.map((p) => p.id === id ? { ...p, ...data } : p))
  }

  function removePlayer(id) {
    setPlayers((s) => s.filter((p) => p.id !== id))
    onUnassign(id)
  }

  function clearField() {
    setAssignment({})
  }

  return (
    <div style={{ fontFamily: 'Inter, ui-sans-serif, system-ui', padding: 18, background: '#0f172a', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', color: '#f8fafc' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h1 style={{ fontSize: 20, fontWeight: 800 }}>London Rohingya Youth FC — Visual Lineup</h1>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select value={formation} onChange={(e) => setFormation(e.target.value)} style={{ padding: '8px 10px', borderRadius: 8 }}>
              {Object.keys(FORMATIONS).map(f => <option key={f} value={f}>{f}</option>)}
            </select>
            <button onClick={clearField} style={{ padding: '8px 10px', borderRadius: 8, background: '#ef4444', color: '#fff', fontWeight: 700 }}>Clear</button>
            <button onClick={() => { navigator.clipboard?.writeText(JSON.stringify({ formation, assignment, players })) }} style={{ padding: '8px 10px', borderRadius: 8, background: '#06b6d4', color: '#002' }}>Copy JSON</button>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 18 }}>
          <aside style={{ background: '#0b1220', padding: 12, borderRadius: 12 }}>
            <h3 style={{ marginBottom: 8 }}>Roster</h3>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input id="newName" placeholder="New player name" style={{ flex: 1, padding: 8, borderRadius: 8 }} />
              <button onClick={() => { const el = document.getElementById('newName'); if (!el) return; const v = el.value.trim(); if (!v) return; addPlayer(v); el.value = '' }} style={{ padding: '8px 10px', borderRadius: 8, background: '#10b981', color: '#002' }}>Add</button>
            </div>

            <div style={{ maxHeight: 560, overflow: 'auto', display: 'grid', gap: 8 }}>
              {unassigned.map(p => (
                <div key={p.id} draggable onDragStart={(e) => onDragStart(e, p.id)} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: 8, background: '#071028', borderRadius: 8 }}>
                  <div style={{ width: 56 }}>
                    <div style={{ width: 56, height: 64, borderRadius: 8, background: p.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>{p.number}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>{p.name}</div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                      <input value={p.number} onChange={(e) => updatePlayer(p.id, { number: Number(e.target.value || 0) })} style={{ width: 56, padding: 6, borderRadius: 6 }} />
                      <input type="color" value={p.color} onChange={(e) => updatePlayer(p.id, { color: e.target.value })} style={{ width: 44, height: 36, padding: 0, border: 'none', background: 'transparent' }} />
                      <button onClick={() => removePlayer(p.id)} style={{ background: '#ef4444', color: '#fff', padding: '6px 8px', borderRadius: 6 }}>Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 12, color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>
              Drag a player onto a position. Double-click a shirt on the field to unassign.
            </div>
          </aside>

          <main>
            {renderPitch()}
          </main>
        </div>

      </div>
    </div>
  )
}
