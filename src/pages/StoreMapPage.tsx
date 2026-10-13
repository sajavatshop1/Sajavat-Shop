import React, { useEffect, useRef } from 'react';

interface StoreMapPageProps {
  setCurrentView: (view: string) => void;
}

declare global {
  interface Window {
    initCommuteMap?: () => void;
    google?: any;
  }
}

const MAPS_API_KEY = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE';
const STORE_LOCATION = { lat: 28.8386, lng: 78.7733 };

export const StoreMapPage: React.FC<StoreMapPageProps> = ({ setCurrentView }) => {
  const initCalledRef = useRef(false);

  useEffect(() => {
    if (initCalledRef.current) return;

    // Inject scoped CSS once
    const styleId = 'sajavat-commute-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .saj-commutes{display:flex;flex-direction:column;height:100%;font-family:Arial,sans-serif;color:#202124}
        .saj-commutes-map{flex:1;position:relative;min-height:340px}
        .saj-commutes-map .map-view{position:absolute;inset:0;background:#e5e3df}
        .saj-commutes-info{flex:0 0 auto;background:#FFF9F2}
        .saj-initial-state{display:flex;align-items:center;gap:12px;padding:12px 16px;border-top:1px solid #E6D7C3}
        .saj-initial-state .desc h3{margin:0;font-size:16px;font-weight:600}
        .saj-initial-state .desc p{margin:2px 0 0;color:#5f6368;font-size:12px}
        .saj-add-btn-primary{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;background:#800020;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;white-space:nowrap;flex-shrink:0}
        .saj-add-btn-primary:hover{background:#6b001a}
        .saj-destinations-strip{position:relative}
        .saj-dest-scroll{display:flex;overflow-x:auto;padding:8px;gap:8px}
        .saj-dest-scroll::-webkit-scrollbar{display:none}
        .saj-add-dest-tile{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;min-width:140px;padding:16px;background:#f3e6d5;border:1px solid #e6d7c3;border-radius:8px;cursor:pointer;color:#800020;font-weight:700;font-size:12px;flex-shrink:0}
        .saj-add-dest-tile:hover{background:#ead5be}
        .saj-dest-card-wrap{position:relative;cursor:pointer;flex-shrink:0}
        .saj-dest-card{min-width:230px;border-radius:4px;box-shadow:0 1px 2px rgba(60,64,67,.3),0 1px 3px rgba(60,64,67,.15);padding:12px;overflow:hidden;color:#5f6368;position:relative}
        .saj-dest-card.active::before{content:'';display:block;position:absolute;top:0;left:0;right:0;height:4px;background:#4285f4;border-radius:4px 4px 0 0}
        .saj-dest-meta{display:flex;align-items:center;gap:4px;margin-bottom:4px;font-size:11px}
        .saj-dest-label{background:#f1f3f4;border-radius:6px;font-weight:700;font-size:12px;width:18px;text-align:center;line-height:18px}
        .saj-dest-name{font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:190px;margin-bottom:4px}
        .saj-dest-eta{font-size:20px;font-weight:700;color:#202124}
        .saj-dest-controls{position:absolute;right:10px;top:10px;display:flex;flex-direction:column;align-items:flex-end;gap:6px}
        .saj-dir-btn{display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:50%;border:1px solid #dadce0;background:#fff;cursor:pointer;text-decoration:none}
        .saj-dir-btn:hover{background:#e8f0fe}
        .saj-edit-btn{background:#fff;border:1px solid #dadce0;border-radius:20px;padding:3px 10px 3px 4px;font-size:12px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:2px;opacity:0;transition:opacity .2s;color:#3c4043}
        .saj-dest-card-wrap:hover .saj-edit-btn{opacity:1}
        .saj-modal-backdrop{display:none;position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:9999;align-items:center;justify-content:center}
        .saj-modal{background:#fff;border-radius:8px;box-shadow:0 4px 24px rgba(0,0,0,.2);width:360px;max-width:92vw;padding:24px}
        .saj-modal h3{margin:0 0 16px;font-size:20px;font-weight:600}
        .saj-modal input[type=text]{width:100%;box-sizing:border-box;padding:10px 12px;font-size:14px;border:1px solid #dadce0;border-radius:6px;outline:none}
        .saj-modal input[type=text]:focus{border-color:#1a73e8;box-shadow:0 0 0 2px #d2e3fc}
        .saj-modal input.error{border-color:#c03}
        .saj-error-msg{color:#c03;font-size:11px;min-height:14px;margin:4px 0}
        .saj-travel-modes{display:flex;border:1px solid #dadce0;border-radius:6px;overflow:hidden;margin:12px 0}
        .saj-travel-modes input[type=radio]{position:absolute;opacity:0;width:0;height:0}
        .saj-travel-modes label{flex:1;display:flex;align-items:center;justify-content:center;padding:8px;cursor:pointer;fill:#5f6368;border-right:1px solid #dadce0;transition:background .2s}
        .saj-travel-modes label:last-child{border-right:none}
        .saj-travel-modes label:hover{background:#f1f3f4}
        .saj-travel-modes input[type=radio]:checked+label{background:#f3e6d5;fill:#800020}
        .saj-travel-modes svg{width:22px;height:22px}
        .saj-modal-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:16px}
        .saj-modal-actions button{border:none;background:none;cursor:pointer;font-size:13px;font-weight:700;padding:8px 12px;border-radius:4px}
        .btn-cancel{color:#5f6368}.btn-cancel:hover{background:#f1f3f4}
        .btn-add,.btn-done{color:#1a73e8}.btn-add:hover,.btn-done:hover{background:#e8f0fe}
        .btn-delete{color:#c5221f;margin-right:auto}.btn-delete:hover{background:#fce8e6}
        .saj-scr-btn{position:absolute;bottom:28px;background:#fff;border:none;border-radius:50%;width:32px;height:32px;box-shadow:0 2px 6px rgba(60,64,67,.25);cursor:pointer;display:none;align-items:center;justify-content:center;z-index:10}
        .saj-scr-btn.visible{display:flex}
        .saj-scr-btn-left{left:6px}.saj-scr-btn-right{right:6px}
      `;
      document.head.appendChild(style);
    }

    const initWidget = () => {
      initCalledRef.current = true;
      const mapEl = document.getElementById('saj-map-view');
      if (!mapEl || !window.google?.maps) return;
      const G = window.google.maps;

      const map = new G.Map(mapEl, {
        center: STORE_LOCATION, zoom: 14, maxZoom: 20,
        fullscreenControl: true, mapTypeControl: false,
        streetViewControl: false, zoomControl: true,
      });

      new G.Marker({
        position: STORE_LOCATION, map,
        label: { text: '●', color: '#fff', fontSize: '18px', fontFamily: 'Arial' },
        icon: {
          path: 'M10 27c-.2 0-.2 0-.5-1-.3-.8-.7-2-1.6-3.5-1-1.5-2-2.7-3-3.8-2.2-2.8-3.9-5-3.9-8.8C1 4.9 5 1 10 1s9 4 9 8.9c0 3.9-1.8 6-4 8.8-1 1.2-1.9 2.4-2.8 3.8-1 1.5-1.4 2.7-1.6 3.5-.3 1-.4 1-.6 1Z',
          fillColor: '#800020', fillOpacity: 1, strokeColor: '#6b001a', strokeWeight: 1,
          anchor: new G.Point(15, 29), scale: 1.2, labelOrigin: new G.Point(10, 9),
        },
        title: 'Sajavat Atelier',
      });

      let destinations: any[] = [];
      let activeIdx: number | undefined;
      let markerCounter = 0;
      const ML = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const getLabel = () => { const l = ML[markerCounter % 26]; markerCounter++; return l; };
      const INACTIVE = { inner: '#BDC1C6', outer: '#80868B' };
      const ACTIVE   = { inner: '#4285F4', outer: '#185ABC' };
      const pinIcon = (fill: string, stroke: string) => ({
        path: 'M10 27c-.2 0-.2 0-.5-1-.3-.8-.7-2-1.6-3.5-1-1.5-2-2.7-3-3.8-2.2-2.8-3.9-5-3.9-8.8C1 4.9 5 1 10 1s9 4 9 8.9c0 3.9-1.8 6-4 8.8-1 1.2-1.9 2.4-2.8 3.8-1 1.5-1.4 2.7-1.6 3.5-.3 1-.4 1-.6 1Z',
        fillColor: fill, fillOpacity: 1, strokeColor: stroke, strokeWeight: 1,
        anchor: new G.Point(15, 29), scale: 1.2, labelOrigin: new G.Point(10, 9),
      });

      const initialPanel = document.getElementById('saj-initial-panel')!;
      const destStrip    = document.getElementById('saj-dest-strip')!;
      const destList     = document.getElementById('saj-dest-list')!;
      const modalBack    = document.getElementById('saj-modal-back')!;
      const modalTitle   = document.getElementById('saj-modal-title')!;
      const destInput    = document.getElementById('saj-dest-input') as HTMLInputElement;
      const errMsg       = document.getElementById('saj-err-msg')!;
      const btnAdd       = document.getElementById('saj-btn-add')!;
      const btnDone      = document.getElementById('saj-btn-done')!;
      const btnCancel    = document.getElementById('saj-btn-cancel')!;
      const btnDelete    = document.getElementById('saj-btn-delete')!;
      const scrLeft      = document.getElementById('saj-scr-left')!;
      const scrRight     = document.getElementById('saj-scr-right')!;
      const destScroll   = document.getElementById('saj-dest-scroll')!;

      const getTravelMode = () => { const el = document.querySelector('input[name="saj-travel"]:checked') as HTMLInputElement; return el ? el.value : 'DRIVING'; };
      const setTravelMode = (mode: string) => { const el = document.getElementById('saj-mode-' + mode.toLowerCase()) as HTMLInputElement; if (el) el.checked = true; };

      const BIAS = 0.5;
      const ac = new G.places.Autocomplete(destInput, { bounds: { north: STORE_LOCATION.lat + BIAS, south: STORE_LOCATION.lat - BIAS, east: STORE_LOCATION.lng + BIAS, west: STORE_LOCATION.lng - BIAS }, fields: ['place_id', 'geometry', 'name'] });
      let placeToAdd: any = null;
      ac.addListener('place_changed', () => { const p = ac.getPlace(); if (p?.geometry?.location) { placeToAdd = p; errMsg.textContent = ''; destInput.classList.remove('error'); } });

      const bikeLayer = new G.BicyclingLayer();
      const transitLayer = new G.TransitLayer();
      const setLayer = (mode: string) => {
        if (mode === 'BICYCLING') { transitLayer.setMap(null); bikeLayer.setMap(map); }
        else if (mode === 'TRANSIT') { bikeLayer.setMap(null); transitLayer.setMap(map); }
        else { bikeLayer.setMap(null); transitLayer.setMap(null); }
      };
      const secs = (v: number) => { if (!v) return ''; if (v < 60) return '<1 min'; if (v > 36000) return '10+ hrs'; const h = Math.floor(v / 3600), m = Math.floor((v % 3600) / 60); return (h ? h + ' h ' : '') + (m ? m + ' min' : ''); };

      let editingIdx: number | undefined;
      let lastFocus: Element | null = null;
      const ICONS: Record<string, string> = {
        DRIVING: '<path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.08 3.11H5.77L6.85 7zM19 17H5v-5h14v5z"/><circle cx="7.5" cy="14.5" r="1.5"/><circle cx="16.5" cy="14.5" r="1.5"/>',
        TRANSIT: '<path d="M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h12v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-3.58-4-8-4zm5.66 3H6.43c.61-.52 2.06-1 5.57-1 3.71 0 5.12.46 5.66 1zM11 7v3H6V7h5zm2 0h5v3h-5V7zm3.5 10h-9c-.83 0-1.5-.67-1.5-1.5V12h12v3.5c0 .83-.67 1.5-1.5 1.5z"/><circle cx="8.5" cy="14.5" r="1.5"/><circle cx="15.5" cy="14.5" r="1.5"/>',
        BICYCLING: '<path d="M15.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM5 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5zm5.8-10l2.4-2.4.8.8c1.3 1.3 3 2.1 5.1 2.1V9c-1.5 0-2.7-.6-3.6-1.5l-1.9-1.9c-.5-.4-1-.6-1.6-.6s-1.1.2-1.4.6L7.8 8.4c-.4.4-.6.9-.6 1.4 0 .6.2 1.1.6 1.4L11 14v5h2v-6.2l-2.2-2.3zM19 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5"/>',
        WALKING: '<path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.56-.89-1.68-1.25-2.65-.84L6 8.3V13h2V9.6l1.8-.7"/>',
      };

      const openModal = (isEdit = false) => {
        lastFocus = document.activeElement;
        modalTitle.textContent = isEdit ? 'Edit destination' : 'Add destination';
        btnAdd.style.display = isEdit ? 'none' : '';
        btnDone.style.display = isEdit ? '' : 'none';
        btnDelete.style.display = isEdit ? '' : 'none';
        modalBack.style.display = 'flex';
        setTimeout(() => destInput.focus(), 50);
      };
      const closeModal = (focusEl?: HTMLElement | null) => {
        modalBack.style.display = 'none';
        destInput.value = ''; destInput.classList.remove('error'); errMsg.textContent = '';
        placeToAdd = null; editingIdx = undefined;
        ((focusEl || lastFocus) as HTMLElement)?.focus?.();
      };
      const validate = (place: any) => {
        if (!place) { errMsg.textContent = 'Select a place from suggestions.'; destInput.classList.add('error'); return false; }
        if (destinations.length >= 10) { errMsg.textContent = 'Max 10 destinations.'; return false; }
        if (destinations.find((d: any) => d.placeId === place.place_id)) { errMsg.textContent = 'Already added.'; destInput.classList.add('error'); return false; }
        return true;
      };

      const renderStrip = () => {
        destList.innerHTML = '';
        destinations.forEach((d: any, i: number) => {
          const wrap = document.createElement('div');
          wrap.className = 'saj-dest-card-wrap';
          wrap.innerHTML = `
            <div class="saj-dest-card${i === activeIdx ? ' active' : ''}" tabindex="0" role="button">
              <div class="saj-dest-meta">
                <svg viewBox="0 0 24 24" width="15" height="15" style="fill:#5f6368">${ICONS[d.mode] || ''}</svg>
                <span>${d.distance || ''}</span>
                <span class="saj-dest-label">${d.label}</span>
              </div>
              <div class="saj-dest-name" title="${d.name}">To ${d.name}</div>
              <div class="saj-dest-eta">${d.eta || '...'}</div>
            </div>
            <div class="saj-dest-controls">
              <a class="saj-dir-btn" href="${d.url}" target="_blank" rel="noopener" aria-label="Directions">
                <svg viewBox="0 0 24 24" width="16" height="16" style="fill:#5f6368"><path d="M22.43 10.59l-9.01-9.01c-.75-.75-2.07-.76-2.83 0l-9 9c-.78.78-.78 2.04 0 2.82l9 9c.39.39.9.58 1.41.58.51 0 1.02-.19 1.41-.58l8.99-8.99c.79-.76.8-2.02.03-2.82zm-10.42 10.4l-9-9 9-9 9 9-9 9zM8 11v4h2v-3h4v2.5l3.5-3.5L14 7.5V10H9c-.55 0-1 .45-1 1z"/></svg>
              </a>
              <button class="saj-edit-btn" aria-label="Edit">
                <svg viewBox="0 0 24 24" width="14" height="14" style="fill:#616161"><path d="M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z"/></svg>
                Edit
              </button>
            </div>`;
          const card = wrap.querySelector('.saj-dest-card')!;
          card.addEventListener('click', () => activateRoute(i));
          card.addEventListener('keydown', (e: any) => { if (e.key === 'Enter') activateRoute(i); });
          wrap.querySelector('.saj-edit-btn')!.addEventListener('click', (e) => {
            e.stopPropagation(); editingIdx = i;
            destInput.value = d.name; placeToAdd = { place_id: d.placeId, name: d.name };
            setTravelMode(d.mode); openModal(true);
          });
          destList.appendChild(wrap);
        });
        updateScrollButtons();
      };

      const activateRoute = (idx: number) => {
        destinations.forEach((d: any, i: number) => {
          d.polylines.inner.setOptions({ strokeColor: i === idx ? ACTIVE.inner : INACTIVE.inner, zIndex: i === idx ? 101 : 2 });
          d.polylines.outer.setOptions({ strokeColor: i === idx ? ACTIVE.outer : INACTIVE.outer, zIndex: i === idx ? 99 : 1 });
          d.marker.setIcon(pinIcon(i === idx ? '#EA4335' : '#F1F3F4', i === idx ? '#C5221F' : '#9AA0A6'));
          d.marker.setLabel({ ...d.marker.getLabel(), color: i === idx ? '#fff' : '#3C4043' });
        });
        activeIdx = idx;
        setLayer(destinations[idx].mode);
        map.fitBounds(destinations[idx].bounds);
        renderStrip();
      };

      const addDestination = (placeObj: any, mode: string, label: string) => {
        new G.DirectionsService().route(
          { origin: STORE_LOCATION, destination: { placeId: placeObj.place_id }, travelMode: mode, unitSystem: G.UnitSystem.METRIC },
          (resp: any) => {
            if (!resp) return;
            const leg = resp.routes[0].legs[0];
            const inner = new G.Polyline({ path: resp.routes[0].overview_path, strokeColor: INACTIVE.inner, strokeOpacity: 1, strokeWeight: 3, zIndex: 2 });
            const outer = new G.Polyline({ path: resp.routes[0].overview_path, strokeColor: INACTIVE.outer, strokeOpacity: 1, strokeWeight: 6, zIndex: 1 });
            const marker = new G.Marker({ position: leg.end_location, map, label: { text: label, color: '#3C4043', fontSize: '13px', fontWeight: '700', fontFamily: 'Arial' }, icon: pinIcon('#F1F3F4', '#9AA0A6') });
            inner.setMap(map); outer.setMap(map);
            const url = `https://www.google.com/maps/dir/?api=1&origin=${STORE_LOCATION.lat},${STORE_LOCATION.lng}&destination=${encodeURIComponent(placeObj.name)}&destination_place_id=${placeObj.place_id}&travelmode=${mode.toLowerCase()}`;
            destinations.push({ name: placeObj.name, placeId: placeObj.place_id, label, mode, url, distance: leg.distance?.text || '', eta: secs(leg.duration?.value || 0), marker, polylines: { inner, outer }, bounds: resp.routes[0].bounds });
            marker.addListener('click', () => { const i = destinations.findIndex((d: any) => d.label === label); if (i >= 0) activateRoute(i); });
            initialPanel.style.display = 'none'; destStrip.style.display = 'block';
            renderStrip(); activateRoute(destinations.length - 1);
          }
        );
      };

      const updateScrollButtons = () => {
        const pos = destScroll.scrollLeft, sw = destScroll.scrollWidth, w = destScroll.offsetWidth;
        if (sw <= w) { scrLeft.classList.remove('visible'); scrRight.classList.remove('visible'); return; }
        scrLeft.classList.toggle('visible', pos > 0);
        scrRight.classList.toggle('visible', Math.ceil(pos + w) < sw);
      };

      scrLeft.addEventListener('click', () => destScroll.scrollBy({ left: -250, behavior: 'smooth' }));
      scrRight.addEventListener('click', () => destScroll.scrollBy({ left: 250, behavior: 'smooth' }));
      destScroll.addEventListener('scroll', updateScrollButtons);

      document.querySelectorAll('.saj-open-modal').forEach(btn => {
        btn.addEventListener('click', () => { setTravelMode('DRIVING'); openModal(false); });
      });

      btnAdd.addEventListener('click', () => { if (!validate(placeToAdd)) return; addDestination(placeToAdd, getTravelMode(), getLabel()); closeModal(); });
      btnDone.addEventListener('click', () => {
        if (editingIdx === undefined) { closeModal(); return; }
        const d = destinations[editingIdx];
        const newMode = getTravelMode(), samePlace = d.placeId === placeToAdd?.place_id, sameMode = d.mode === newMode;
        if (samePlace && sameMode) { closeModal(); return; }
        if (!samePlace && !validate(placeToAdd)) return;
        d.polylines.inner.setMap(null); d.polylines.outer.setMap(null); d.marker.setMap(null);
        const label = d.label; destinations.splice(editingIdx, 1); renderStrip();
        addDestination(samePlace ? { place_id: d.placeId, name: d.name } : placeToAdd, newMode, label);
        closeModal();
      });
      btnCancel.addEventListener('click', () => closeModal());
      btnDelete.addEventListener('click', () => {
        if (editingIdx === undefined) { closeModal(); return; }
        const d = destinations[editingIdx];
        d.polylines.inner.setMap(null); d.polylines.outer.setMap(null); d.marker.setMap(null);
        destinations.splice(editingIdx, 1); activeIdx = undefined;
        if (!destinations.length) { initialPanel.style.display = ''; destStrip.style.display = 'none'; }
        else { renderStrip(); activateRoute(Math.min(editingIdx, destinations.length - 1)); }
        closeModal();
      });
      modalBack.addEventListener('mousedown', (e) => { if (e.target === modalBack) closeModal(); });
      modalBack.addEventListener('keydown', (e: any) => { if (e.key === 'Escape') closeModal(); });
    };

    if (window.google?.maps) { initWidget(); }
    else {
      window.initCommuteMap = initWidget;
      if (!document.getElementById('gmaps-script')) {
        const s = document.createElement('script');
        s.id = 'gmaps-script';
        s.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_API_KEY}&callback=initCommuteMap&libraries=places,geometry`;
        s.async = true; s.defer = true;
        document.body.appendChild(s);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#FFF9F2]">
      {/* Header */}
      <div className="bg-[#800020] text-[#FFF9F2] py-10 px-4 text-center">
        <button type="button" onClick={() => setCurrentView('contact')}
          className="inline-flex items-center gap-1.5 text-[#F3E6D5]/70 hover:text-[#F3E6D5] text-xs uppercase tracking-widest mb-4 transition-colors cursor-pointer">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
          Back to Contact
        </button>
        <h1 className="font-serif text-3xl sm:text-4xl font-light mb-2">Find Our Atelier</h1>
        <p className="text-[#F3E6D5]/80 text-sm max-w-md mx-auto leading-relaxed">
          Plan your visit — search your location to estimate commute time and get step-by-step directions to the Sajavat Atelier.
        </p>
        <div className="flex items-center justify-center gap-2 mt-4 text-[#F3E6D5]/70 text-xs">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
          14 Heritage Lane, Moradabad, Uttar Pradesh 244001
        </div>
      </div>

      {/* Hint strip */}
      <div className="bg-[#F3E6D5]/60 border-b border-[#E6D7C3] px-4 py-2.5 text-center text-[11px] text-[#554745] tracking-wide">
        Click <strong>Add destination</strong> → search your address → choose travel mode → get live ETA
        {MAPS_API_KEY === 'YOUR_API_KEY_HERE' && (
          <span className="ml-3 inline-block px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 rounded normal-case font-semibold">
            ⚠ Set VITE_GOOGLE_MAPS_API_KEY in .env to activate the map
          </span>
        )}
      </div>

      {/* Map Widget */}
      <div className="max-w-6xl mx-auto px-0 sm:px-4 py-4">
        <div className="saj-commutes rounded-none sm:rounded-xl overflow-hidden shadow-lg border border-[#E6D7C3]" style={{ height: '600px' }}>
          <div className="saj-commutes-map">
            <div id="saj-map-view" style={{ position: 'absolute', inset: 0, background: '#e5e3df' }} />
          </div>
          <div className="saj-commutes-info">
            <div id="saj-initial-panel" className="saj-initial-state">
              <svg aria-hidden="true" width="44" height="44" viewBox="0 0 53 53" fill="none">
                <path d="M41 20H18.6c-9.5 0-10.8 13.5 0 13.5h14.5C41 33.5 41 45 33 45H17.7" stroke="#D2E3FC" strokeWidth="5"/>
                <path d="M41 22c.2 0 .4 0 .6-.2l.4-.5c.3-1 .7-1.7 1.1-2.5l2-3c.8-1 1.5-2 2-3 .6-1 .9-2.3.9-3.8 0-2-.7-3.6-2-5-1.4-1.3-3-2-5-2s-3.6.7-5 2c-1.3 1.4-2 3-2 5 0 1.4.3 2.6.8 3.6s1.2 2 2 3.2c.9 1 1.6 2 2 2.8.5.9 1 1.7 1.2 2.7l.4.5.6.2Zm0-10.5c-.7 0-1.3-.2-1.8-.7-.5-.5-.7-1.1-.7-1.8s.2-1.3.7-1.8c.5-.5 1.1-.7 1.8-.7s1.3.2 1.8.7c.5.5.7 1.1.7 1.8s-.2 1.3-.7 1.8c-.5.5-1.1.7-1.8.7Z" fill="#185ABC"/>
                <path d="m12 32-8 6v12h5v-7h6v7h5V38l-8-6Z" fill="#4285F4"/>
              </svg>
              <div className="desc">
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Estimate commute time</h3>
                <p style={{ margin: '2px 0 0', color: '#5f6368', fontSize: '12px' }}>Get travel time from your location to our atelier</p>
              </div>
              <button className="saj-add-btn-primary saj-open-modal">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                Add destination
              </button>
            </div>
            <div id="saj-dest-strip" className="saj-destinations-strip" style={{ display: 'none', position: 'relative' }}>
              <div id="saj-dest-scroll" className="saj-dest-scroll">
                <div id="saj-dest-list" style={{ display: 'flex', gap: '8px' }} />
                <button className="saj-add-dest-tile saj-open-modal">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                  Add destination
                </button>
              </div>
              <button id="saj-scr-left" className="saj-scr-btn saj-scr-btn-left" aria-label="Scroll left">
                <svg width="16" height="16" viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
              </button>
              <button id="saj-scr-right" className="saj-scr-btn saj-scr-btn-right" aria-label="Scroll right">
                <svg width="16" height="16" viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Store Info Cards */}
      <div className="max-w-6xl mx-auto px-4 pb-14">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z', title: 'Visit Us', lines: ['14 Heritage Lane, Moradabad', 'Uttar Pradesh 244001, India'] },
            { icon: 'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z', title: 'Atelier Hours', lines: ['Mon – Sat: 10:00 AM – 7:00 PM', 'Sunday: By appointment only'] },
            { icon: 'M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z', title: 'Contact', lines: ['+91 98765 43210', 'concierge@sajavat.com'] },
          ].map((card) => (
            <div key={card.title} className="bg-white border border-[#E6D7C3] rounded-xl p-5 flex items-start gap-4 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-[#F3E6D5] flex items-center justify-center shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#800020"><path d={card.icon}/></svg>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-widest font-bold text-[#800020] mb-1">{card.title}</p>
                {card.lines.map((l, i) => <p key={i} className="text-sm text-[#332927] leading-snug">{l}</p>)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      <div id="saj-modal-back" className="saj-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="saj-modal-title">
        <div className="saj-modal">
          <h3 id="saj-modal-title">Add destination</h3>
          <input type="text" id="saj-dest-input" placeholder="Enter a place or address" autoComplete="off" />
          <div id="saj-err-msg" className="saj-error-msg" role="alert" />
          <div className="saj-travel-modes">
            {[
              { id: 'driving',   v: 'DRIVING',   label: 'Driving',   d: 'M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.08 3.11H5.77L6.85 7zM19 17H5v-5h14v5z', ex: 'circle cx="7.5" cy="14.5" r="1.5"/><circle cx="16.5" cy="14.5" r="1.5' },
              { id: 'transit',   v: 'TRANSIT',   label: 'Transit',   d: 'M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h12v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-3.58-4-8-4zm5.66 3H6.43c.61-.52 2.06-1 5.57-1 3.71 0 5.12.46 5.66 1zM11 7v3H6V7h5zm2 0h5v3h-5V7zm3.5 10h-9c-.83 0-1.5-.67-1.5-1.5V12h12v3.5c0 .83-.67 1.5-1.5 1.5z', ex: 'circle cx="8.5" cy="14.5" r="1.5"/><circle cx="15.5" cy="14.5" r="1.5' },
              { id: 'bicycling', v: 'BICYCLING', label: 'Cycling',   d: 'M15.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM5 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5zm5.8-10l2.4-2.4.8.8c1.3 1.3 3 2.1 5.1 2.1V9c-1.5 0-2.7-.6-3.6-1.5l-1.9-1.9c-.5-.4-1-.6-1.6-.6s-1.1.2-1.4.6L7.8 8.4c-.4.4-.6.9-.6 1.4 0 .6.2 1.1.6 1.4L11 14v5h2v-6.2l-2.2-2.3zM19 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5', ex: '' },
              { id: 'walking',   v: 'WALKING',   label: 'Walking',   d: 'M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.56-.89-1.68-1.25-2.65-.84L6 8.3V13h2V9.6l1.8-.7', ex: '' },
            ].map((m, i) => (
              <React.Fragment key={m.id}>
                <input type="radio" name="saj-travel" id={`saj-mode-${m.id}`} value={m.v} defaultChecked={i === 0} aria-label={m.label} />
                <label htmlFor={`saj-mode-${m.id}`} title={m.label}>
                  <svg viewBox="0 0 24 24">
                    <path d={m.d}/>
                    {m.ex && <g dangerouslySetInnerHTML={{ __html: '<' + m.ex + '/>' }} />}
                  </svg>
                </label>
              </React.Fragment>
            ))}
          </div>
          <div className="saj-modal-actions">
            <button id="saj-btn-delete" className="btn-delete" style={{ display: 'none' }}>Delete</button>
            <button id="saj-btn-cancel" className="btn-cancel">Cancel</button>
            <button id="saj-btn-add" className="btn-add">Add</button>
            <button id="saj-btn-done" className="btn-done" style={{ display: 'none' }}>Done</button>
          </div>
        </div>
      </div>
    </div>
  );
};
