const LEADS = "vetra.leads.v1";
const MEETINGS = "vetra.meetings.v1";
const DRAFT = "vetra.meeting-draft.v1";
const PROJECTS = "vetra.site-projects.v1";
const AUTH = "vetra.auth.v1";
const STUDIO_FOCUS = "vetra.studio-focus.v1";

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
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
  localStorage.removeItem(DRAFT);
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
  localStorage.removeItem(STUDIO_FOCUS);
  return data?.id || null;
}

export function setAuth(user) {
  write(AUTH, { user, at: Date.now() });
}
export function clearAuth() {
  localStorage.removeItem(AUTH);
}
export function getAuth() {
  return read(AUTH, null);
}
