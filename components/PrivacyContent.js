"use client";

import React from 'react'

export default function PrivacyContent(){
  return (
    <div>
      <p style={{ color: '#ccc', lineHeight: 1.6 }}>
        Adons Studio uses Google Tag Manager (GTM) to manage analytics tags on this site. We only collect
        anonymous, aggregated analytics data to help improve the site experience — for example, which pages
        are visited, how users navigate between pages, and which interactions (like showreel plays) occur.
      </p>

      <h2 style={{ color: '#fff', marginTop: '1.25rem' }}>What we collect</h2>
      <ul style={{ color: '#ccc', lineHeight: 1.6 }}>
        <li>Pageviews (path and timestamp)</li>
        <li>Event interactions (button clicks, showreel plays, tag clicks) — no personal identifiers</li>
        <li>Device and browser metadata (user agent, screen size) as reported by analytics services</li>
      </ul>

      <h2 style={{ color: '#fff', marginTop: '1.25rem' }}>Your choices</h2>
      <p style={{ color: '#ccc', lineHeight: 1.6 }}>
        You can choose whether to allow analytics. Use the consent banner (bottom-right) to Accept or Deny analytics collection.
        Denying will prevent GTM from loading and no analytics events will be sent.
      </p>

      <h2 style={{ color: '#fff', marginTop: '1.25rem' }}>Contact</h2>
      <p style={{ color: '#ccc', lineHeight: 1.6 }}>
        If you have questions about data collection, email us at <a href="mailto:adonsstudio3@gmail.com" style={{ color: '#FFD700' }}>adonsstudio3@gmail.com</a>.
      </p>
    </div>
  )
}
