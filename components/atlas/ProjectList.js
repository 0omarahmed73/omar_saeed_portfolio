'use client';

import { useState } from 'react';
import { D, atlas } from '@/lib/data';
import '@/app/atlas.css';

// Plain, scannable project list with category filters. Works without the animated sequence above it.
export default function ProjectList() {
  const [filter, setFilter] = useState('All');
  const rows = D.en.projects.filter(p => filter === 'All' || p[5] === filter);
  return (
    <section id="projects" className="at-list at-scope" aria-labelledby="at-list-title">
      <h2 id="at-list-title">{atlas.listTitle}</h2>
      <p className="at-lede">{atlas.listNote}</p>
      <div className="at-filters" role="group" aria-label="Filter projects by category">
        {atlas.categories.map(c => (
          <button key={c} type="button" aria-pressed={filter === c} onClick={() => setFilter(c)}>{c}</button>
        ))}
      </div>
      <ol className="at-plates">
        {rows.map(([name, client, text, tags, , , url, src], i) => (
          <li key={name} className="at-plate">
            <span className="at-n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
            <div><h3>{name}</h3><div className="at-cl">{client}</div></div>
            <div>
              <p>{text}</p>
              <ul className="at-tg">{tags.map(t => <li key={t}>{t}</li>)}</ul>
              {url && <a className="at-live" href={url} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${name} live site (opens in a new tab)`}>Visit live site</a>}
              {src && <a className="at-live" href={src} target="_blank" rel="noopener noreferrer" aria-label={`${name} source code on GitHub (opens in a new tab)`}>Source code</a>}
            </div>
          </li>
        ))}
      </ol>
      <p className="at-count" aria-live="polite">{rows.length} {rows.length === 1 ? 'project' : 'projects'}</p>
    </section>
  );
}
