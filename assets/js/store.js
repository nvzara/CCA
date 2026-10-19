/* 접수 대장 — 모든 기록은 이 브라우저의 localStorage에만 보관된다. */
window.CN = window.CN || {};

CN.store = (function () {
  const KEY = 'chiikawa-kentei.v1';
  let db = null;

  function blank() {
    return { v: 1, users: [], current: null, apps: [], licenses: [], seq: { app: 0, lic: 0 } };
  }
  function load() {
    try { db = JSON.parse(localStorage.getItem(KEY)); } catch (e) { db = null; }
    if (!db || db.v !== 1) db = blank();
    return db;
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(db)); return true; } catch (e) { return false; }
  }
  load();

  const api = {
    save,
    me() { return db.users.find((u) => u.id === db.current) || null; },
    users() { return db.users.slice(); },
    register(data) {
      const u = { id: 'u' + Date.now().toString(36), name: data.name.trim(), birth: data.birth, avatar: data.avatar, createdAt: new Date().toISOString() };
      db.users.push(u);
      db.current = u.id;
      save();
      return u;
    },
    updateMe(patch) {
      const u = api.me();
      if (!u) return;
      Object.assign(u, patch);
      save();
    },
    switchUser(id) { db.current = id; save(); },
    logout() { db.current = null; save(); },

    apply(certId, grade, kind, venueId, fee) {
      const u = api.me();
      const c = CN.certs[certId];
      const d = new Date();
      db.seq.app += 1;
      const no = String(d.getFullYear()).slice(2) + c.code + (grade || 0) + '-' +
        CN.u.pad(d.getMonth() + 1, 2) + CN.u.pad(d.getDate(), 2) + '-' + CN.u.pad(db.seq.app, 4);
      const app = { no, userId: u.id, certId, grade, kind, venue: venueId, fee, appliedAt: d.toISOString(), status: '접수완료', result: null, session: null };
      db.apps.push(app);
      save();
      return app;
    },
    getApp(no) { return db.apps.find((a) => a.no === no) || null; },
    myApps() {
      const u = api.me();
      return u ? db.apps.filter((a) => a.userId === u.id).slice().reverse() : [];
    },
    saveApp(app) {
      const i = db.apps.findIndex((a) => a.no === app.no);
      if (i >= 0) db.apps[i] = app;
      save();
    },

    /* 필기 합격 기록 중 2년 이내 것 */
    writtenValid(userId, certId, grade) {
      const limit = Date.now() - 2 * 365 * 24 * 3600 * 1000;
      return db.apps.filter((a) => a.userId === userId && a.certId === certId && a.grade === grade && a.kind === 'written' &&
        a.result && a.result.pass && new Date(a.finishedAt).getTime() >= limit).pop() || null;
    },
    /* 최종 합격 기록 (실기가 있으면 실기 합격, 없으면 필기 합격) */
    finalPass(userId, certId, grade) {
      const c = CN.certs[certId];
      const kind = c.practical ? 'practical' : 'written';
      return db.apps.filter((a) => a.userId === userId && a.certId === certId && a.grade === grade && a.kind === kind && a.result && a.result.pass).pop() || null;
    },
    /* 같은 등급 또는 그보다 높은 등급을 최종 합격했는지 (풀뽑기 검정은 숫자가 작을수록 상위) */
    hasGradeOrAbove(userId, certId, grade) {
      const c = CN.certs[certId];
      return c.grades.some((g) => (grade === 0 ? g === 0 : g <= grade) && api.finalPass(userId, certId, g));
    },

    issue(passApp, form) {
      const u = api.me();
      const c = CN.certs[passApp.certId];
      const old = db.licenses.filter((l) => l.userId === u.id && l.certId === passApp.certId && l.grade === passApp.grade && l.status === '유효');
      old.forEach((l) => { l.status = '재발급으로 효력 상실'; });
      db.seq.lic += 1;
      const year = new Date().getFullYear();
      const body = year + '-' + c.code + (passApp.grade || 0) + '-' + CN.u.pad(db.seq.lic, 6);
      const lic = {
        licNo: body + '-' + CN.u.checkChar(body),
        userId: u.id, name: u.name, birth: u.birth, avatar: Object.assign({}, u.avatar),
        certId: passApp.certId, grade: passApp.grade, passDate: passApp.finishedAt, passNo: passApp.no,
        issuedAt: new Date().toISOString(), form, status: '유효', reissue: old.length > 0,
      };
      db.licenses.push(lic);
      save();
      return lic;
    },
    myLicenses() {
      const u = api.me();
      return u ? db.licenses.filter((l) => l.userId === u.id).slice().reverse() : [];
    },
    findLicense(no) {
      return db.licenses.find((l) => l.licNo === no) || null;
    },
    reset() { db = blank(); save(); },
  };
  return api;
})();
