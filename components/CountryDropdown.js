"use client";
import React, { useState, useMemo, useRef, useEffect } from "react";
import { countries } from "country-data-list";
import { CircleFlag } from "react-circle-flags";
import styles from "./ContactForm.module.css";

function normalizeDial(raw) {
  if (!raw) return '';
  // country-data-list may include values like ['+1'] or ['1'] or ['+1']
  const r = String(raw).trim();
  if (r.startsWith('+')) return r;
  return r ? `+${r}` : '';
}

const buildList = () => {
  return countries.all
    .filter((c) => c && c.name && (c.countryCallingCodes && c.countryCallingCodes.length > 0))
    .map((c) => ({
      code: c.alpha2 || c.alpha3 || c.ioc || c.name,
      alpha2: (c.alpha2 || '').toLowerCase(),
      flagEmoji: c.emoji || '',
      name: c.name,
      dial: normalizeDial(c.countryCallingCodes[0])
    }));
};

export default function CountryDropdown({ value, onChange, className, placeholder = "Select" }) {
  const list = useMemo(buildList, []);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef(null);

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    function handlePointerDown(e) {
      if (!open) return;
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(c => c.name.toLowerCase().includes(q) || c.dial.includes(q) || c.code.toLowerCase() === q);
  }, [query, list]);

  // value may be an alpha2 code (e.g. 'us') or a dial code (e.g. '+1')
  let current = list.find(c => (c.alpha2 && c.alpha2.toLowerCase() === String(value).toLowerCase()));
  if (!current) current = list.find(c => c.dial === value) || list[0] || { flagEmoji: '🏳️', name: placeholder, dial: '' };

  return (
    <div ref={wrapRef} className={[styles.dropdownWrap, className].filter(Boolean).join(' ')}>
      <button type="button" className={styles.countryTrigger} onClick={() => setOpen(s => !s)} aria-expanded={open}>
        {current.alpha2 ? (
          <div className={styles.flag}><CircleFlag countryCode={current.alpha2} height={16} /></div>
        ) : (
          <span className={styles.flag}>{current.flagEmoji}</span>
        )}
        <span className={styles.dial}>{current.dial}</span>
      </button>
      {open && (
        <div className={styles.dropdown} role="listbox">
          <input className={styles.dropdownSearch} placeholder="Search country or code..." value={query} onChange={e => setQuery(e.target.value)} />
          <div className={styles.dropdownList}>
            {filtered.map((c) => (
              <button key={c.code} type="button" className={styles.dropdownItem} onClick={() => { onChange && onChange({ code: c.code, name: c.name, dial: c.dial, alpha2: c.alpha2 }); setOpen(false); }}>
                <div className="inline-flex items-center gap-2">
                  {c.alpha2 ? (
                    <div className={styles.flag}><CircleFlag countryCode={c.alpha2} height={20} /></div>
                  ) : (
                    <span className={styles.flag}>{c.flagEmoji}</span>
                  )}
                  <span className={styles.name}>{c.name}</span>
                </div>
                <span className={styles.dial} style={{ marginLeft: 'auto' }}>{c.dial}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}