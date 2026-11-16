const LEADS = "vetra.leads.v1";
const MEETINGS = "vetra.meetings.v1";
const DRAFT = "vetra.meeting-draft.v1";
const PROJECTS = "vetra.site-projects.v1";
const AUTH = "vetra.auth.v1";
const STUDIO_FOCUS = "vetra.studio-focus.v1";
const LICENSE = "vetra.license.v1";

export const LICENSE_PRICE = 17;
export const DEFAULT_PIX_KEY = "seu-pix@exemplo.com";

function hasStorage() {
  try {
    const probe = "__vetra_probe__";
    localStorage.setItem(probe, probe);
    localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

const storageEnabled = hasStorage();

function read(key, fallback) {
  if (!storageEnabled) return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  if (!storageEnabled) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // sem armazenamento disponível, ignora para manter a UX funcional.
  }
}

export function getLicenseState() {
  return read(LICENSE, {
    active: false,
    price: LICENSE_PRICE,
    pixKey: DEFAULT_PIX_KEY,
    paidAt: null,
    activatedAt: null,
    customer: null
  });
}

export function setLicenseState(next) {
  const state = {
    active: Boolean(next?.active),
    price: LICENSE_PRICE,
    pixKey: next?.pixKey || DEFAULT_PIX_KEY,
    paidAt: next?.paidAt || Date.now(),
    activatedAt: next?.activatedAt || Date.now(),
    customer: next?.customer || null
  };
  write(LICENSE, state);
  return state;
}

export function clearLicenseState() {
  if (storageEnabled) localStorage.removeItem(LICENSE);
}

export function isLicenseActive() {
  return Boolean(getLicenseState()?.active);
}

export function loadLeads() {
  return read(LEADS, []);
}
export function saveLeads(leads) {
  write(LEADS, leads);
}

export function loadMeetings() {
  return read(MEETINGS, []);
}
export function saveMeetings(items) {
  write(MEETINGS, items);
}

export function setMeetingDraft(data) {
  write(DRAFT, data);
}
export function consumeMeetingDraft() {
  const data = read(DRAFT, null);
  if (storageEnabled) localStorage.removeItem(DRAFT);
  return data;
}

export function loadProjects() {
  return read(PROJECTS, []);
}
export function saveProjects(items) {
  write(PROJECTS, items);
}
export function setStudioFocus(id) {
  write(STUDIO_FOCUS, { id });
}
export function consumeStudioFocus() {
  const data = read(STUDIO_FOCUS, null);
  if (storageEnabled) localStorage.removeItem(STUDIO_FOCUS);
  return data?.id || null;
}

export function setAuth(user) {
  write(AUTH, { user, at: Date.now() });
}
export function clearAuth() {
  if (storageEnabled) localStorage.removeItem(AUTH);
}
export function getAuth() {
  return read(AUTH, null);
}
