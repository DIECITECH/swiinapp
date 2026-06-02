import { useState, useEffect, useRef, createContext, useContext } from "react";

const MOCK_USERS = {
  "usr_customer": {
    uid: "usr_customer", email: "client@swiin.app", password: "demo1234",
    displayName: "Dieumerci Kabila", firstName: "Dieumerci", lastName: "Kabila",
    phone: "+243812345678", role: "customer", status: "active",
    referralSlug: "dieumk", kycVerified: false, emailVerified: true,
    walletSnapshot: { availableBalance: 14280, pendingBalance: 2400, totalEarned: 34130, unpaidFees: 874, currency: "USD" },
    affiliateStats: { totalReferrals: 10, totalConversions: 23, totalCommissionsGross: 6614, totalCommissionsNet: 5953, totalFeesGenerated: 661, activeLinks: 7, conversionRate: 6.3 },
    createdAt: "2026-01-15T08:00:00Z",
  },
  "usr_merchant": {
    uid: "usr_merchant", email: "merchant@swiin.app", password: "demo1234",
    displayName: "Jordan Store", firstName: "Jordan", lastName: "Moanda",
    phone: "+243898765432", role: "merchant", status: "active",
    referralSlug: "jordan", kycVerified: true, emailVerified: true,
    merchantId: "mrc_jordan",
    walletSnapshot: { availableBalance: 0, pendingBalance: 0, totalEarned: 0, unpaidFees: 0, currency: "USD" },
    affiliateStats: { totalReferrals: 0, totalConversions: 0, totalCommissionsGross: 0, totalCommissionsNet: 0, totalFeesGenerated: 0, activeLinks: 0, conversionRate: 0 },
    createdAt: "2025-11-03T09:00:00Z",
  },
  "usr_admin": {
    uid: "usr_admin", email: "admin@swiin.app", password: "demo1234",
    displayName: "Admin SWIIN", firstName: "Admin", lastName: "SWIIN",
    phone: "+243800000001", role: "admin", status: "active",
    referralSlug: "admin", kycVerified: true, emailVerified: true,
    walletSnapshot: { availableBalance: 0, pendingBalance: 0, totalEarned: 0, unpaidFees: 0, currency: "USD" },
    affiliateStats: { totalReferrals: 0, totalConversions: 0, totalCommissionsGross: 0, totalCommissionsNet: 0, totalFeesGenerated: 0, activeLinks: 0, conversionRate: 0 },
    createdAt: "2025-01-01T00:00:00Z",
  },
};

const MOCK_MERCHANTS = {
  "mrc_jordan": {
    merchantId: "mrc_jordan", ownerId: "usr_merchant",
    name: "Jordan Store", slug: "jordan-store", type: "retail",
    description: "Sneakers & mode urbaine premium",
    email: "merchant@swiin.app", phone: "+243898765432",
    address: "Av. Colonel Ebeya", city: "Kinshasa", country: "CD",
    logoUrl: "", coverUrl: "",
    acceptedPaymentMethods: ["cash","mobile_money","card"],
    mobileMoneyProviders: ["orange","airtel"],
    status: "active", isVerified: true,
    rating: 4.8, ratingCount: 127,
    stats: { totalRevenue: 241000, totalOrders: 148, totalValidatedOrders: 142, totalActiveAffiliates: 34, totalLockedAffiliates: 2, totalCommissionsPaid: 24100, totalSwiinFeesGenerated: 2410, conversionRate: 6.3 },
  },
};
const SESSION_KEY = "swiin_mock_session";
let _sessionUser = null;
let _authListeners = [];

const MockAuth = {
  get currentUser() { return _sessionUser; },
  onAuthStateChanged(cb) {
    if (!_sessionUser) {
      try {
        const saved = sessionStorage.getItem(SESSION_KEY);
        if (saved) _sessionUser = JSON.parse(saved);
      } catch(_) {}
    }
    cb(_sessionUser);
    _authListeners.push(cb);
    return () => { _authListeners = _authListeners.filter(l => l !== cb); };
  },
  _emit() { _authListeners.forEach(fn => fn(_sessionUser)); },
  signIn(uid) {
    _sessionUser = { uid };
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(_sessionUser)); } catch(_) {}
    this._emit();
  },
  signOut() {
    _sessionUser = null;
    try { sessionStorage.removeItem(SESSION_KEY); } catch(_) {}
    this._emit();
  },
};
const MockDB = {
  users: { ...MOCK_USERS },
  merchants: { ...MOCK_MERCHANTS },
  superMerchants: {},
  feePayments: {},
  adminLogs: [],

  getUser(uid) { return this.users[uid] || null; },
  setUser(uid, data) { this.users[uid] = { ...this.users[uid], ...data }; },
  getMerchant(mid) { return this.merchants[mid] || null; },
  setMerchant(mid, data) { this.merchants[mid] = { ...this.merchants[mid], ...data }; },
  findByEmail(email) { return Object.values(this.users).find(u => u.email === email) || null; },
  newId(prefix) { return prefix + "_" + Math.random().toString(36).slice(2, 9); },
  now() { return new Date().toISOString(); },
};
const ThemeCtx = createContext({ dark: true, toggle: () => {} });
const useTheme = () => useContext(ThemeCtx);
const F = "'Poppins', sans-serif";

function Tk(dark) {
  return dark ? {
    bg:"#080808", card:"#141414", card2:"#1A1A1A",
    line:"rgba(255,255,255,0.06)", line2:"rgba(255,255,255,0.11)",
    primary:"#FFFFFF", sec:"#888888", tert:"#444444",
    green:"#5BFF7A", gL:"rgba(91,255,122,0.1)", gM:"rgba(91,255,122,0.2)",
    purple:"#7B4DFF", pL:"rgba(123,77,255,0.1)",
    red:"#FF4B4B", rL:"rgba(255,75,75,0.1)",
    amber:"#F59E0B", aL:"rgba(245,158,11,0.1)",
    shadow:"none", navBg:"rgba(8,8,8,0.97)", inv:"#000",
  } : {
    bg:"#F7F7F5", card:"#FFFFFF", card2:"#F2F2F0",
    line:"rgba(0,0,0,0.07)", line2:"rgba(0,0,0,0.13)",
    primary:"#0A0A0A", sec:"#777777", tert:"#BBBBBB",
    green:"#00B341", gL:"rgba(0,179,65,0.08)", gM:"rgba(0,179,65,0.18)",
    purple:"#6B3FD4", pL:"rgba(107,63,212,0.08)",
    red:"#D93025", rL:"rgba(217,48,37,0.08)",
    amber:"#B45309", aL:"rgba(180,83,9,0.08)",
    shadow:"0 1px 8px rgba(0,0,0,0.06)", navBg:"rgba(247,247,245,0.97)", inv:"#fff",
  };
}
const AuthCtx = createContext({});
const useAuth = () => useContext(AuthCtx);

const AUTH_ERRORS = {
  "not_found":   "Aucun compte trouvé avec cet email.",
  "wrong_pass":  "Mot de passe incorrect.",
  "email_taken": "Cet email est déjà utilisé.",
  "suspended":   "Ce compte a été suspendu.",
  "weak_pass":   "Le mot de passe doit comporter au moins 6 caractères.",
  "invalid_email":"Adresse email invalide.",
};

function AuthProvider({ children }) {
  const [authUser, setAuthUser]   = useState(undefined);
  const [profile, setProfile]     = useState(null);
  const [authError, setAuthError] = useState(null);
  useEffect(() => {
    const unsub = MockAuth.onAuthStateChanged((u) => {
      if (u) {
        const p = MockDB.getUser(u.uid);
        setAuthUser(u);
        setProfile(p);
      } else {
        setAuthUser(null);
        setProfile(null);
      }
    });
    return unsub;
  }, []);

  const loading = authUser === undefined;
  const role    = profile?.role || null;
  const login = ({ email, password }) => {
    setAuthError(null);
    const found = MockDB.findByEmail(email.trim().toLowerCase());
    if (!found) { setAuthError(AUTH_ERRORS.not_found); return { success: false }; }
    if (found.status === "suspended") { setAuthError(AUTH_ERRORS.suspended); return { success: false }; }
    if (found.password !== password) { setAuthError(AUTH_ERRORS.wrong_pass); return { success: false }; }
    MockAuth.signIn(found.uid);
    return { success: true, role: found.role };
  };
  const register = ({ email, password, role: newRole, extraData = {} }) => {
    setAuthError(null);
    if (!email.includes("@")) { setAuthError(AUTH_ERRORS.invalid_email); return { success: false }; }
    if (password.length < 6)  { setAuthError(AUTH_ERRORS.weak_pass);     return { success: false }; }
    if (MockDB.findByEmail(email.trim().toLowerCase())) { setAuthError(AUTH_ERRORS.email_taken); return { success: false }; }

    const uid  = MockDB.newId("usr");
    const now  = MockDB.now();
    const slug = (extraData.displayName || email.split("@")[0]).toLowerCase()
                   .replace(/\s+/g,"").replace(/[^a-z0-9]/g,"").slice(0,10)
                 + Math.random().toString(36).slice(2,5);

    const userDoc = {
      uid, email: email.trim().toLowerCase(), password,
      displayName:   extraData.displayName || `${extraData.firstName||""} ${extraData.lastName||""}`.trim() || email,
      firstName:     extraData.firstName    || "",
      lastName:      extraData.lastName     || "",
      phone:         extraData.phone        || "",
      avatarUrl:     "",
      referralSlug:  slug,
      role:          newRole,
      status:        "pending_otp",
      kycVerified:   false,
      emailVerified: false,
      phoneVerified: false,
      walletSnapshot: { availableBalance:0, pendingBalance:0, totalEarned:0, unpaidFees:0, currency:"USD" },
      affiliateStats: { totalReferrals:0, totalConversions:0, totalCommissionsGross:0, totalCommissionsNet:0, totalFeesGenerated:0, activeLinks:0, conversionRate:0 },
      createdAt: now, updatedAt: now,
    };

    MockDB.setUser(uid, userDoc);
    const otpCode = OtpDB.generate(uid);
    MockDB.setUser(uid, { _pendingOtp: otpCode });

    if (newRole === "merchant") {
      const mid   = MockDB.newId("mrc");
      const bname = extraData.businessName || extraData.displayName || "Ma Boutique";
      const bslug = bname.toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"") + "-" + Math.random().toString(36).slice(2,5);
      MockDB.setMerchant(mid, {
        merchantId: mid, ownerId: uid,
        name: bname, slug: bslug, fullUrl: `swiin.app/store/${bslug}`,
        type:        extraData.merchantType || "retail",
        description: extraData.description  || "",
        email:       email, phone: extraData.phone || "",
        address:     extraData.address || "", city: extraData.city || "", country: "CD",
        logoUrl:"", coverUrl:"", galleryUrls:[],
        acceptedPaymentMethods: extraData.paymentMethods  || ["cash"],
        mobileMoneyProviders:   extraData.mobileProviders || [],
        status:"pending", isVerified:false, rating:0, ratingCount:0,
        stats:{ totalRevenue:0, totalOrders:0, totalValidatedOrders:0, totalActiveAffiliates:0, totalLockedAffiliates:0, totalCommissionsPaid:0, totalSwiinFeesGenerated:0, conversionRate:0 },
        createdAt: now, updatedAt: now,
      });
      MockDB.setUser(uid, { merchantId: mid });
    }

    if (newRole === "super_merchant") {
      const smId = MockDB.newId("sm");
      MockDB.superMerchants[smId] = {
        superMerchantId: smId, userId: uid,
        displayName: extraData.displayName || "", email,
        qualificationStatus: "pending",
        merchantsOnboarded: 0, merchantsActive: 0, qualificationThreshold: 20,
        revenueShareRate: 0.20,
        earningsSnapshot: { totalNetworkSwiinFees:0, totalEarnings:0, pendingEarnings:0, paidEarnings:0, currentMonthFees:0, currentMonthEarnings:0 },
        walletBalance: 0, currency: "USD",
        createdAt: now,
      };
      MockDB.setUser(uid, { superMerchantId: smId });
    }

    MockAuth.signIn(uid);
    return { success: true, role: newRole, uid, needsOtp: true, otpCode };
  };
  const resetPassword = (email) => {
    setAuthError(null);
    if (!email.includes("@")) { setAuthError(AUTH_ERRORS.invalid_email); return { success: false }; }
    return { success: true };
  };
  const logout = () => { MockAuth.signOut(); };
  const updateProfile = (data) => {
    if (!authUser) return;
    MockDB.setUser(authUser.uid, data);
    setProfile(p => ({ ...p, ...data }));
  };

  const clearError = () => setAuthError(null);

  return (
    <AuthCtx.Provider value={{ user:authUser, profile, role, loading, authError, login, logout, register, resetPassword, updateProfile, clearError }}>
      {children}
    </AuthCtx.Provider>);
}
function useGuard(allowedRoles) {
  const { role, loading, profile } = useAuth();
  return {
    allowed:     !loading && !!role && allowedRoles.includes(role),
    isLocked:    profile?.status === "locked" || profile?.status === "suspended",
    hasFeeDebt:  (profile?.walletSnapshot?.unpaidFees || 0) > 0,
    loading,
  };
}
const IC = {
  user:    "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  mail:    "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6",
  lock:    "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z M7 11V7a5 5 0 0 1 10 0v4",
  eye:     "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  eyeOff:  "M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94 M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19 M1 1l22 22",
  phone:   "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.68 2h3.06a2 2 0 0 1 2 1.72 13 13 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.6a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45 13 13 0 0 0 2.81.7A2 2 0 0 1 22 16.92z",
  store:   "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  check:   "M20 6L9 17l-5-5",
  arL:     "M19 12H5 M12 19l-7-7 7-7",
  alert:   "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01",
  logout:  "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9",
  zap:     "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  sun:     "M12 1v2 M12 21v2 M4.22 4.22l1.42 1.42 M18.36 18.36l1.42 1.42 M1 12h2 M21 12h2 M4.22 19.78l1.42-1.42 M18.36 5.64l1.42-1.42 M12 5a7 7 0 1 0 0 14A7 7 0 0 0 12 5z",
  moon:    "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z",
  home:    "M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z M9 21V12h6v9",
  camera:  "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  mappin:  "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  scissors:"M6 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6z M6 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6z M20 4L8.12 15.88 M14.47 14.48L20 20 M8.12 8.12L12 12",
  utensils:"M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2 M7 2v20 M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7",
  coffee:  "M17 8h1a4 4 0 0 1 0 8h-1 M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z M6 1v3 M10 1v3 M14 1v3",
  sparkle: "M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z",
  hotel:   "M3 22V12h18v10 M3 12L12 2l9 10 M9 22v-4h6v4",
  globe:   "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z M2 12h20 M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z",
  star:    "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  mappin:  "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  search:  "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M21 21l-4.35-4.35",
  qr:      "M3 3h6v6H3z M15 3h6v6h-6z M3 15h6v6H3z M15 15h2v2h-2z M19 15h2v2h-2z M15 19h2v2h-2z M19 19h2v2h-2z M9 9h2v2H9z",
  clock:   "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z M12 6v6l4 2",
  settings:"M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
  bell:    "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0",
  users:   "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  shield:  "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  credit:  "M1 4h22v16H1z M1 10h22",
  wallet:  "M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5 M16 12a1 1 0 1 0 2 0 1 1 0 0 0-2 0",
  chart:   "M18 20V10 M12 20V4 M6 20v-6",
  percent: "M19 5L5 19 M6.5 7a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z M17.5 20a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z",
  unlock:  "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z M7 11V7a5 5 0 1 1 9.9-1",
  link:    "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71 M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
  check2:  "M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
  copy:    "M20 9h-9a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2z M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1",
  download:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3",
  arR:     "M5 12h14 M12 5l7 7-7 7",
  settings:"M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
  bell:    "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0",
  eye:     "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
};

const Ico = ({ n, size=20, color, sw=1.5 }) => {
  const { dark } = useTheme(); const t = Tk(dark);
  const c = color || t.primary;
  const d = IC[n] || IC.home;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
      style={{ display:"block", flexShrink:0 }}>
      {d.split(" M").map((seg,i) => <path key={i} d={i===0 ? seg : "M"+seg}/>)}
    </svg>);
};
const Div = ({ m="10px 0" }) => { const {dark}=useTheme(); const t=Tk(dark); return <div style={{height:"0.5px",background:t.line,margin:m}}/>; };
const Lbl = ({ children, style={} }) => { const {dark}=useTheme(); const t=Tk(dark); return <div style={{fontSize:10,fontWeight:500,letterSpacing:1,textTransform:"uppercase",color:t.sec,...style}}>{children}</div>; };
const H   = ({ children, size=18, style={} }) => { const {dark}=useTheme(); const t=Tk(dark); return <div style={{fontSize:size,fontWeight:700,letterSpacing:-0.4,color:t.primary,...style}}>{children}</div>; };

function Card({ children, style={}, border }) {
  const {dark}=useTheme(); const t=Tk(dark);
  return <div style={{background:t.card,border:`0.5px solid ${border||t.line}`,borderRadius:18,padding:"16px 18px",boxShadow:t.shadow,...style}}>{children}</div>;
}

function Chip({ label, color="green" }) {
  const {dark}=useTheme(); const t=Tk(dark);
  const m={green:[t.gL,t.green],purple:[t.pL,t.purple],red:[t.rL,t.red],amber:[t.aL,t.amber]};
  const [bg,fg]=m[color]||m.green;
  return <span style={{background:bg,color:fg,fontSize:10,fontWeight:600,padding:"3px 9px",borderRadius:20}}>{label}</span>;
}

function Btn({ children, onClick, v="primary", icon, style={}, disabled=false }) {
  const {dark}=useTheme(); const t=Tk(dark);
  const [p,setP]=useState(false);
  const V={
    primary:{background:t.primary,color:t.inv},
    ghost:{background:"transparent",color:t.primary,border:`0.5px solid ${t.line2}`},
    green:{background:t.green,color:"#000"},
    danger:{background:t.rL,color:t.red,border:`0.5px solid ${t.red}30`},
    amber:{background:t.aL,color:t.amber,border:`0.5px solid ${t.amber}30`},
    purple:{background:t.pL,color:t.purple,border:`0.5px solid ${t.purple}30`},
  };
  const ic=v==="primary"||v==="green"?t.inv:v==="danger"?t.red:v==="amber"?t.amber:v==="purple"?t.purple:t.primary;
  return (
    <button disabled={disabled}
      onMouseDown={()=>setP(true)} onMouseUp={()=>setP(false)} onMouseLeave={()=>setP(false)}
      onClick={onClick}
      style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,width:"100%",border:"none",borderRadius:14,padding:"14px 20px",fontSize:14,fontWeight:600,cursor:disabled?"not-allowed":"pointer",fontFamily:F,transition:"all 0.15s",transform:p?"scale(0.97)":"scale(1)",opacity:disabled?0.38:1,...V[v],...style}}>
      {icon&&<Ico n={icon} size={15} color={ic}/>}{children}</button>);
}

function TextInput({ label, icon, type="text", value, onChange, error, placeholder, hint }) {
  const {dark}=useTheme(); const t=Tk(dark);
  const [focused,setFocused]=useState(false);
  const [show,setShow]=useState(false);
  const isPwd = type==="password";
  return (
    <div style={{marginBottom:14}}>
      {label&&<Lbl style={{marginBottom:6}}>{label}</Lbl>}
      <div style={{display:"flex",alignItems:"center",gap:10,background:t.card2,borderRadius:14,border:`0.5px solid ${error?t.red+"60":focused?t.line2:t.line}`,padding:"13px 14px",transition:"border-color 0.2s"}}>
        {icon&&<Ico n={icon} size={16} color={error?t.red:focused?t.primary:t.sec}/>}
        <input type={isPwd?(show?"text":"password"):type} value={value} onChange={onChange}
          placeholder={placeholder}
          onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
          style={{flex:1,background:"transparent",border:"none",outline:"none",color:t.primary,fontSize:14,fontFamily:F,minWidth:0}}/>
        {isPwd&&<button onClick={()=>setShow(s=>!s)} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex"}}><Ico n={show?"eyeOff":"eye"} size={14} color={t.sec}/></button>}
      </div>
      {error&&<div style={{fontSize:11,color:t.red,marginTop:5,marginLeft:4}}>{error}</div>}
      {hint&&!error&&<div style={{fontSize:11,color:t.sec,marginTop:5,marginLeft:4}}>{hint}</div>}</div>);
}

function SelectInput({ label, icon, value, onChange, options, error }) {
  const {dark}=useTheme(); const t=Tk(dark);
  return (
    <div style={{marginBottom:14}}>
      {label&&<Lbl style={{marginBottom:6}}>{label}</Lbl>}
      <div style={{display:"flex",alignItems:"center",gap:10,background:t.card2,borderRadius:14,border:`0.5px solid ${error?t.red+"60":t.line}`,padding:"13px 14px"}}>
        {icon&&<Ico n={icon} size={16} color={t.sec}/>}
        <select value={value} onChange={onChange}
          style={{flex:1,background:"transparent",border:"none",outline:"none",color:value?t.primary:t.sec,fontSize:14,fontFamily:F,appearance:"none"}}>
          <option value="" style={{background:t.card,color:t.primary}}>Sélectionner...</option>
          {options.map(o=><option key={o.value} value={o.value} style={{background:t.card,color:t.primary}}>{o.label}</option>)}
        </select></div>
      {error&&<div style={{fontSize:11,color:t.red,marginTop:5,marginLeft:4}}>{error}</div>}</div>);
}

function ErrorBanner({ message, onDismiss }) {
  const {dark}=useTheme(); const t=Tk(dark);
  if (!message) return null;
  return (
    <div style={{background:t.rL,border:`0.5px solid ${t.red}40`,borderRadius:14,padding:"12px 14px",marginBottom:16,display:"flex",alignItems:"flex-start",gap:10}}>
      <Ico n="alert" size={16} color={t.red}/>
      <div style={{flex:1,fontSize:12,color:t.red,lineHeight:1.5}}>{message}</div>
      {onDismiss&&<button onClick={onDismiss} style={{background:"none",border:"none",color:t.red,cursor:"pointer",fontSize:16,lineHeight:1,padding:0}}>×</button>}
    </div>);
}

function SuccessBanner({ message }) {
  const {dark}=useTheme(); const t=Tk(dark);
  if (!message) return null;
  return (
    <div style={{background:t.gL,border:`0.5px solid ${t.gM}`,borderRadius:14,padding:"12px 14px",marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
      <Ico n="check" size={16} color={t.green}/>
      <div style={{flex:1,fontSize:12,color:t.green,lineHeight:1.5}}>{message}</div></div>);
}

function ThemeToggle() {
  const {dark,toggle}=useTheme(); const t=Tk(dark);
  return (
    <button onClick={toggle} style={{background:t.card2,border:`0.5px solid ${t.line2}`,borderRadius:10,padding:"7px 10px",cursor:"pointer",display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
      <Ico n={dark?"sun":"moon"} size={14} color={t.sec}/>
      <span style={{fontSize:10,fontWeight:600,color:t.sec}}>{dark?"Mode clair":"Mode sombre"}</span></button>);
}

const MERCHANT_TYPES = [
  {value:"retail",     label:"Boutique retail",  icon:"store"},
  {value:"restaurant", label:"Restaurant",        icon:"utensils"},
  {value:"cafe",       label:"Café / Lounge",     icon:"coffee"},
  {value:"salon",      label:"Salon de beauté",   icon:"sparkle"},
  {value:"barber",     label:"Barbershop",        icon:"scissors"},
  {value:"spa",        label:"Spa & Bien-être",   icon:"zap"},
  {value:"hotel",      label:"Hôtel",             icon:"hotel"},
  {value:"service",    label:"Prestataire",       icon:"globe"},
];
function SplashScreen({ onDone }) {
  const {dark}=useTheme(); const t=Tk(dark);
  useEffect(()=>{
    const id=setTimeout(onDone,1800);
    return ()=>clearTimeout(id);
  },[onDone]);
  return (
    <div style={{height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12}}>
      <style>{`@keyframes fu{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes dt{0%,80%,100%{opacity:0.2}40%{opacity:1}}`}</style>
      <div style={{animation:"fu 0.7s ease forwards",textAlign:"center"}}>
        <div style={{fontSize:52,fontWeight:800,letterSpacing:-2}}><span style={{color:t.primary}}>SWI</span><span style={{color:t.green}}>IN</span></div>
        <div style={{fontSize:11,letterSpacing:3,color:t.sec,marginTop:8}}>ACHETEZ · PARTAGEZ · GAGNEZ</div></div>
      <div style={{marginTop:36,display:"flex",gap:5}}>
        {[0,1,2].map(i=><div key={i} style={{width:5,height:5,borderRadius:"50%",background:t.sec,animation:`dt 1.2s ${i*0.18}s ease-in-out infinite`}}/>)}
      </div></div>);
}
function OtpScreen({ uid, phone, otpCode: initialCode, onVerified }) {
  const {dark}=useTheme(); const t=Tk(dark);
  const [digits,setDigits]=useState(["","","","","",""]);
  const [error,setError]=useState("");
  const [success,setSuccess]=useState(false);
  const [timeLeft,setTimeLeft]=useState(300);
  const [attempts,setAttempts]=useState(0);
  const [resendCount,setResendCount]=useState(0);
  const [currentCode,setCurrentCode]=useState(initialCode||OtpDB.getCode(uid)||"");
  const refs = [useRef(),useRef(),useRef(),useRef(),useRef(),useRef()];

  useEffect(()=>{
    const interval=setInterval(()=>{
      setTimeLeft(t=>{ if(t<=1){clearInterval(interval);return 0;} return t-1; });
    },1000);
    return()=>clearInterval(interval);
  },[]);

  useEffect(()=>{ refs[0]?.current?.focus(); },[]);

  const formatTime = (s)=>`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  const handleDigit=(i,val)=>{
    if(!/^\d*$/.test(val)) return;
    const nd=[...digits]; nd[i]=val.slice(-1);
    setDigits(nd); setError("");
    if(val&&i<5) refs[i+1]?.current?.focus();
    if(nd.every(d=>d) && nd.join("").length===6) {
      setTimeout(()=>handleVerify(nd.join("")),100);
    }
  };

  const handleKeyDown=(i,e)=>{
    if(e.key==="Backspace"&&!digits[i]&&i>0) refs[i-1]?.current?.focus();
  };

  const handleVerify=(code)=>{
    const input=code||digits.join("");
    if(input.length<6) return;
    if(timeLeft===0){ setError("Code expiré. Renvoyez un nouveau code."); return; }
    if(attempts>=3){ setError("Trop de tentatives. Renvoyez un nouveau code."); return; }
    const result = OtpDB.validate(uid, input);
    if(result.ok || input===currentCode) {
      setSuccess(true);
      MockDB.setUser(uid, { phoneVerified:true, status:"active", _pendingOtp:null });
      setTimeout(()=>onVerified(), 1500);
    } else {
      setAttempts(a=>a+1);
      setError(result.reason==="expired"?"Code expiré.":result.reason==="locked"?"Trop de tentatives.":"Code invalide.");
      setDigits(["","","","","",""]);
      refs[0]?.current?.focus();
    }
  };

  const handleResend=()=>{
    const newCode=OtpDB.generate(uid);
    MockDB.setUser(uid,{_pendingOtp:newCode});
    setCurrentCode(newCode);
    setDigits(["","","","","",""]);
    setError(""); setAttempts(0); setTimeLeft(300);
    setResendCount(r=>r+1);
    refs[0]?.current?.focus();
  };

  return (
    <div style={{padding:"40px 24px",minHeight:"100%",display:"flex",flexDirection:"column"}}>
      {}
      <div style={{textAlign:"center",marginBottom:36}}>
        <div style={{width:64,height:64,borderRadius:"50%",background:t.gL,border:`0.5px solid ${t.gM}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}>
          <Ico n="phone" size={28} color={t.green}/></div>
        <H size={24} style={{marginBottom:8}}>Vérification</H>
        <H size={24} style={{marginBottom:12,color:t.green}}>du numéro</H>
        <div style={{fontSize:13,color:t.sec,lineHeight:1.7}}>
          Un code de vérification a été envoyé<br/>à votre numéro de téléphone.</div></div>

      {}
      {currentCode&&!success&&(
        <div style={{background:t.aL,border:`0.5px solid ${t.amber}40`,borderRadius:14,padding:"12px 16px",marginBottom:24,textAlign:"center"}}>
          <div style={{fontSize:10,color:t.amber,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Code de test MVP</div>
          <div style={{fontSize:28,fontWeight:800,letterSpacing:8,fontFamily:"monospace",color:t.amber}}>{currentCode}</div>
          <div style={{fontSize:10,color:t.amber,opacity:0.7,marginTop:4}}>Expire dans {formatTime(timeLeft)}</div>
        </div>
      )}

      {}
      {!success&&(
        <>
          <div style={{display:"flex",gap:10,justifyContent:"center",marginBottom:16}}>
            {digits.map((d,i)=>(
              <input key={i} ref={refs[i]}
                value={d} onChange={e=>handleDigit(i,e.target.value)}
                onKeyDown={e=>handleKeyDown(i,e)}
                maxLength={1} inputMode="numeric"
                style={{
                  width:46,height:56,textAlign:"center",fontSize:24,fontWeight:700,
                  background:t.card2,border:`1.5px solid ${error?t.red:d?t.primary:t.line2}`,
                  borderRadius:14,color:t.primary,fontFamily:F,outline:"none",
                  transition:"border-color 0.2s",
                }}/>
            ))}</div>

          {error&&(
            <div style={{display:"flex",alignItems:"center",gap:6,justifyContent:"center",marginBottom:12}}>
              <Ico n="alert" size={13} color={t.red}/>
              <span style={{fontSize:12,color:t.red}}>{error}</span></div>
          )}

          <button onClick={()=>handleVerify("")}
            disabled={digits.some(d=>!d)}
            style={{width:"100%",padding:"15px",borderRadius:14,border:"none",background:digits.every(d=>d)?t.primary:t.card2,color:digits.every(d=>d)?t.inv:t.sec,fontSize:14,fontWeight:700,cursor:digits.every(d=>d)?"pointer":"not-allowed",fontFamily:F,marginBottom:14,transition:"all 0.2s"}}>
            Vérifier mon numéro</button>

          <div style={{textAlign:"center"}}>
            {timeLeft>0?(
              <span style={{fontSize:12,color:t.sec}}>Renvoi possible dans {formatTime(timeLeft)}</span>
            ):(
              <button onClick={handleResend} style={{background:"none",border:"none",color:t.primary,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:F}}>
                Renvoyer le code</button>
            )}</div>
        </>
      )}

      {}
      {success&&(
        <div style={{textAlign:"center",flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:14}}>
          <div style={{width:72,height:72,borderRadius:"50%",background:t.gL,border:`2px solid ${t.green}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <Ico n="check" size={32} color={t.green} sw={2.5}/></div>
          <H size={20} style={{color:t.green}}>Numéro vérifié !</H>
          <div style={{fontSize:12,color:t.sec}}>Votre compte est maintenant actif.</div></div>
      )}</div>);
}
function FeesPaymentScreen({ unpaidAmount, uid, onClose, onSubmitted }) {
  const {dark}=useTheme(); const t=Tk(dark);
  const [step,setStep]=useState("numbers");
  const [selected,setSelected]=useState(null);
  const [form,setForm]=useState({ txId:"", txName:"", txPhone:"", amount:"", txDate:"", network:"" });
  const [errors,setErrors]=useState({});
  const set=k=>e=>{setErrors({});setForm(f=>({...f,[k]:e.target.value}));};

  const validate=()=>{
    const e={};
    if(!form.txId.trim()) e.txId="Requis";
    if(!form.txName.trim()) e.txName="Requis";
    if(!form.amount||parseFloat(form.amount)<=0) e.amount="Montant invalide";
    if(!form.txPhone.trim()) e.txPhone="Requis";
    if(!form.txDate.trim()) e.txDate="Requis";
    if(!form.network) e.network="Sélectionnez un réseau";
    setErrors(e); return Object.keys(e).length===0;
  };

  const handleSubmit=()=>{
    if(!validate()) return;
    FeePaymentsDB.submit({
      id:"FPS-"+Date.now(), uid, name:MockDB.getUser(uid)?.displayName||"Créateur",
      amount:parseFloat(form.amount), network:form.network,
      txId:form.txId, txName:form.txName, txPhone:form.txPhone, txDate:form.txDate,
      status:"pending", submittedAt:new Date().toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"})
    });
    setStep("submitted");
    if(onSubmitted) onSubmitted();
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:300,overflowY:"auto"}}>
      <div style={{minHeight:"100%",background:t.bg,maxWidth:430,margin:"0 auto",padding:"24px 18px 40px"}}>

        {}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <div><Lbl style={{marginBottom:4,color:t.amber}}>FRAIS SWIIN</Lbl><H size={20}>Régler les frais</H></div>
          <button onClick={onClose} style={{background:t.card2,border:`0.5px solid ${t.line2}`,borderRadius:10,padding:"7px 10px",cursor:"pointer",fontFamily:F,color:t.sec,fontSize:18,lineHeight:1}}>×</button>
        </div>

        {step==="submitted"&&(
          <div style={{textAlign:"center",padding:"40px 0",display:"flex",flexDirection:"column",alignItems:"center",gap:16}}>
            <div style={{width:72,height:72,borderRadius:"50%",background:t.aL,border:`1.5px solid ${t.amber}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <Ico n="check" size={32} color={t.amber}/></div>
            <H size={22}>Paiement soumis</H>
            <div style={{fontSize:13,color:t.sec,lineHeight:1.8,textAlign:"center"}}>
              Votre paiement est en cours de vérification.<br/>
              L'équipe SWIIN validera votre transaction sous 24h.<br/>
              Vos liens seront débloqués après validation.</div>
            <div style={{background:t.card,border:`0.5px solid ${t.line}`,borderRadius:16,padding:16,width:"100%"}}>
              <div style={{fontSize:11,color:t.sec,marginBottom:4}}>Référence de transaction</div>
              <div style={{fontSize:13,fontWeight:700,fontFamily:"monospace",color:t.primary}}>{form.txId}</div></div>
            <button onClick={onClose} style={{width:"100%",padding:"14px",borderRadius:14,border:"none",background:t.primary,color:t.inv,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:F}}>
              Fermer</button></div>
        )}

        {step==="numbers"&&(
          <>
            {}
            <div style={{background:t.aL,border:`0.5px solid ${t.amber}40`,borderRadius:16,padding:"14px 16px",marginBottom:20}}>
              <Lbl style={{marginBottom:6,color:t.amber}}>Montant à régler</Lbl>
              <div style={{fontSize:32,fontWeight:800,color:t.amber}}>${unpaidAmount.toFixed(2)}</div>
              <div style={{fontSize:11,color:t.amber,opacity:0.8,marginTop:4}}>Frais SWIIN (10% de vos commissions)</div>
            </div>

            {}
            <div style={{background:t.card,border:`0.5px solid ${t.line}`,borderRadius:14,padding:"13px 16px",marginBottom:16}}>
              <div style={{fontSize:12,color:t.sec,lineHeight:1.8}}>
                Effectuez le paiement vers l'un des numéros ci-dessous, puis renseignez les informations de transaction pour vérification.
              </div></div>

            {}
            <Lbl style={{marginBottom:10}}>Numéros de paiement SWIIN</Lbl>
            {SWIIN_MM_NUMBERS.map(mm=>(
              <div key={mm.id} style={{background:t.card,border:`0.5px solid ${mm.active?t.line:t.line}`,borderRadius:14,padding:"13px 16px",marginBottom:8,opacity:mm.active?1:0.4}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:t.primary}}>{mm.label}</div>
                    <div style={{fontSize:16,fontWeight:800,letterSpacing:1,color:t.primary,marginTop:4}}>{mm.number}</div>
                    <div style={{fontSize:11,color:t.sec,marginTop:2}}>Bénéficiaire : {mm.name}</div></div>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                    <Chip label={mm.active?"Actif":"Inactif"} color={mm.active?"green":"red"}/></div></div></div>
            ))}

            <button onClick={()=>setStep("form")}
              style={{width:"100%",padding:"14px",borderRadius:14,border:"none",background:t.primary,color:t.inv,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:F,marginTop:16}}>
              J'ai effectué le paiement →</button>
          </>
        )}

        {step==="form"&&(
          <>
            <button onClick={()=>setStep("numbers")} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:6,marginBottom:20,padding:0}}>
              <Ico n="arL" size={16} color={t.sec}/><span style={{fontSize:12,color:t.sec}}>Retour aux numéros</span>
            </button>

            <Lbl style={{marginBottom:6}}>Réseau utilisé</Lbl>
            <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
              {SWIIN_MM_NUMBERS.filter(m=>m.active).map(mm=>(
                <button key={mm.id} onClick={()=>setForm(f=>({...f,network:mm.id}))}
                  style={{padding:"8px 14px",borderRadius:10,border:`0.5px solid ${form.network===mm.id?t.primary:t.line2}`,background:form.network===mm.id?t.primary:"transparent",color:form.network===mm.id?t.inv:t.sec,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:F}}>
                  {mm.label}</button>
              ))}</div>
            {errors.network&&<div style={{fontSize:11,color:t.red,marginBottom:8}}>{errors.network}</div>}

            {[
              ["ID de transaction","txId","text","Ex: IC260513.1346.E03861"],
              ["Nom affiché sur la transaction","txName","text","Nom visible sur le reçu"],
              ["Numéro de téléphone utilisé","txPhone","tel","Ex: +243 800 000 000"],
              ["Montant payé","amount","number","Montant exact"],
              ["Date du paiement","txDate","text","Ex: 12 juin 2026"],
            ].map(([label,field,type,placeholder])=>(
              <div key={field} style={{marginBottom:12}}>
                <Lbl style={{marginBottom:5}}>{label}</Lbl>
                <div style={{display:"flex",alignItems:"center",gap:10,background:t.card2,border:`0.5px solid ${errors[field]?t.red+"60":t.line2}`,borderRadius:12,padding:"12px 14px"}}>
                  <input type={type} value={form[field]} onChange={set(field)} placeholder={placeholder}
                    style={{flex:1,background:"transparent",border:"none",outline:"none",color:t.primary,fontSize:13,fontFamily:F}}/>
                </div>
                {errors[field]&&<div style={{fontSize:11,color:t.red,marginTop:4}}>{errors[field]}</div>}</div>
            ))}

            <button onClick={handleSubmit}
              style={{width:"100%",padding:"14px",borderRadius:14,border:"none",background:t.amber,color:"#000",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:F,marginTop:8}}>
              Soumettre pour vérification</button>
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,marginTop:10}}>
              <Ico n="shield" size={12} color={t.tert}/>
              <span style={{fontSize:10,color:t.tert}}>Vérification manuelle par l'équipe SWIIN</span></div>
          </>
        )}</div></div>);
}

function RoleSelectionScreen({ onSelect }) {
  const {dark}=useTheme(); const t=Tk(dark);
  const [sel,setSel]=useState(null);
  const roles=[
    {id:"customer",       label:"Créateur",         sub:"Achetez, partagez et gagnez des commissions",   icon:"user",   color:"green"},
    {id:"merchant",       label:"Marchand",        sub:"Gérez votre boutique et vos affiliés",           icon:"store",  color:"purple"},
    {id:"super_merchant", label:"Super Merchant",  sub:"Recrutez et gérez un réseau de marchands",      icon:"zap",    color:"amber"},
  ];
  const cm={green:[t.gL,t.green],purple:[t.pL,t.purple],amber:[t.aL,t.amber]};
  return (
    <div style={{padding:"36px 22px"}}>
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:24}}><ThemeToggle/></div>
      <Lbl style={{marginBottom:8}}>SWIIN</Lbl>
      <H size={26} style={{marginBottom:6}}>Bienvenue SWIIN TEST.</H>
      <div style={{fontSize:13,color:t.sec,marginBottom:28,lineHeight:1.6}}>Choisissez votre profil pour commencer.</div>
      <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:24}}>
        {roles.map(r=>{
          const [bg,fg]=cm[r.color];
          const on=sel===r.id;
          return (
            <div key={r.id} onClick={()=>setSel(r.id)}
              style={{padding:"15px 16px",borderRadius:18,cursor:"pointer",border:`0.5px solid ${on?fg:t.line}`,background:on?bg:"transparent",display:"flex",alignItems:"center",gap:14,transition:"all 0.2s"}}>
              <div style={{width:44,height:44,borderRadius:14,background:on?fg:t.card2,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.2s"}}>
                <Ico n={r.icon} size={20} color={on?"#000":t.sec}/></div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:700,color:t.primary}}>{r.label}</div>
                <div style={{fontSize:11,color:t.sec,marginTop:2,lineHeight:1.4}}>{r.sub}</div></div>
              {on&&<Ico n="check" size={16} color={fg}/>}</div>);
        })}</div>
      <Btn disabled={!sel} onClick={()=>onSelect(sel)}>Continuer</Btn>
      <div style={{textAlign:"center",marginTop:18}}>
        <span style={{fontSize:12,color:t.sec}}>Déjà un compte ? </span>
        <span onClick={()=>onSelect("login")} style={{fontSize:12,color:t.primary,fontWeight:600,cursor:"pointer"}}>Se connecter</span>
      </div></div>);
}
function LoginScreen({ onSuccess, onRegister, onForgot }) {
  const {dark}=useTheme(); const t=Tk(dark);
  const {login,authError,clearError}=useAuth();
  const [form,setForm]=useState({email:"",password:""});
  const [errors,setErrors]=useState({});

  const set = k => e => { clearError(); setForm(f=>({...f,[k]:e.target.value})); };

  const validate = () => {
    const e={};
    if (!form.email.includes("@")) e.email="Email invalide";
    if (form.password.length<6)    e.password="Au moins 6 caractères";
    setErrors(e); return Object.keys(e).length===0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const r=login({email:form.email,password:form.password});
    if (r.success) onSuccess(r.role);
  };

  const fillDemo = (email) => {
    clearError(); setErrors({});
    setForm({email,password:"demo1234"});
  };

  return (
    <div style={{padding:"36px 22px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28}}>
        <div><Lbl style={{marginBottom:6}}>SWIIN</Lbl><H size={26}>Connexion.</H></div>
        <ThemeToggle/></div>
      <ErrorBanner message={authError} onDismiss={clearError}/>
      <TextInput label="Email" icon="mail" type="email" value={form.email} onChange={set("email")} placeholder="vous@example.com" error={errors.email}/>
      <TextInput label="Mot de passe" icon="lock" type="password" value={form.password} onChange={set("password")} placeholder="••••••••" error={errors.password}/>
      <div style={{textAlign:"right",marginBottom:20}}>
        <span onClick={onForgot} style={{fontSize:12,color:t.sec,cursor:"pointer"}}>Mot de passe oublié ?</span></div>
      <Btn onClick={handleSubmit}>Se connecter</Btn>
      <Div m="18px 0"/>
      <div style={{textAlign:"center"}}>
        <span style={{fontSize:12,color:t.sec}}>Pas de compte ? </span>
        <span onClick={onRegister} style={{fontSize:12,color:t.primary,fontWeight:600,cursor:"pointer"}}>Créer un compte</span>
      </div>

      {}
      <Card style={{marginTop:22}}>
        <Lbl style={{marginBottom:10}}>Comptes de démonstration</Lbl>
        {[
          {label:"Créateur",  email:"client@swiin.app"},
          {label:"Marchand",email:"merchant@swiin.app"},
          {label:"Admin",   email:"admin@swiin.app"},
        ].map(d=>(
          <div key={d.email} onClick={()=>fillDemo(d.email)}
            style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 0",cursor:"pointer",borderBottom:`0.5px solid ${t.line}`}}>
            <span style={{fontSize:12,fontWeight:600,color:t.primary}}>{d.label}</span>
            <span style={{fontSize:10,fontFamily:"monospace",color:t.sec}}>{d.email}</span></div>
        ))}
        <div style={{fontSize:10,color:t.tert,marginTop:8,textAlign:"center"}}>
          Cliquez pour remplir · Mot de passe : <span style={{fontFamily:"monospace"}}>demo1234</span></div>
      </Card></div>);
}
function ForgotScreen({ onBack }) {
  const {dark}=useTheme(); const t=Tk(dark);
  const {resetPassword,authError,clearError}=useAuth();
  const [email,setEmail]=useState("");
  const [success,setSuccess]=useState(false);

  const handleSubmit = () => {
    clearError();
    const r=resetPassword(email);
    if (r.success) setSuccess(true);
  };

  return (
    <div style={{padding:"36px 22px"}}>
      <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",marginBottom:24,display:"flex",alignItems:"center",gap:6}}>
        <Ico n="arL" size={16} color={t.sec}/><span style={{fontSize:12,color:t.sec}}>Retour</span></button>
      <H size={24} style={{marginBottom:6}}>Réinitialiser.</H>
      <div style={{fontSize:13,color:t.sec,marginBottom:24}}>Entrez votre email pour recevoir un lien de réinitialisation.</div>
      <ErrorBanner message={authError} onDismiss={clearError}/>
      <SuccessBanner message={success?`Lien envoyé à ${email}. Vérifiez votre boîte mail.`:null}/>
      {!success&&(
        <>
          <TextInput label="Email" icon="mail" type="email" value={email} onChange={e=>{clearError();setEmail(e.target.value);}} placeholder="vous@example.com"/>
          <Btn onClick={handleSubmit}>Envoyer le lien</Btn>
        </>
      )}
      {success&&<Btn v="ghost" onClick={onBack}>Retour à la connexion</Btn>}</div>);
}
function CustomerRegisterScreen({ onSuccess, onLogin }) {
  const {dark}=useTheme(); const t=Tk(dark);
  const {register,authError,clearError}=useAuth();
  const [step,setStep]=useState(1);
  const [errors,setErrors]=useState({});
  const [form,setForm]=useState({firstName:"",lastName:"",email:"",phone:"",password:"",confirmPassword:""});
  const set = k => e => { clearError(); setErrors({}); setForm(f=>({...f,[k]:e.target.value})); };

  const v1=()=>{
    const e={};
    if(!form.firstName.trim()) e.firstName="Requis";
    if(!form.lastName.trim())  e.lastName="Requis";
    if(!form.email.includes("@")) e.email="Email invalide";
    setErrors(e); return Object.keys(e).length===0;
  };
  const v2=()=>{
    const e={};
    if(form.password.length<6) e.password="Au moins 6 caractères";
    if(form.password!==form.confirmPassword) e.confirmPassword="Ne correspondent pas";
    setErrors(e); return Object.keys(e).length===0;
  };

  const handleRegister=()=>{
    if(!v2()) return;
    const r=register({email:form.email,password:form.password,role:"customer",
      extraData:{displayName:`${form.firstName} ${form.lastName}`.trim(),firstName:form.firstName,lastName:form.lastName,phone:form.phone}});
    if(r.success) onSuccess("customer");
  };

  const steps=["Profil","Sécurité"];
  return (
    <div style={{padding:"36px 22px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
        <div><Lbl style={{marginBottom:6}}>Nouveau compte</Lbl><H size={22}>Client SWIIN.</H></div>
        <ThemeToggle/></div>
      <div style={{display:"flex",gap:6,marginBottom:24}}>
        {steps.map((s,i)=>(
          <div key={s} style={{flex:1}}>
            <div style={{height:2,borderRadius:1,background:step>i?t.primary:t.line,marginBottom:4}}/>
            <div style={{fontSize:9,color:step===i+1?t.primary:t.tert,textAlign:"center",fontWeight:step===i+1?600:400}}>{s}</div>
          </div>
        ))}</div>
      <ErrorBanner message={authError} onDismiss={clearError}/>
      {step===1&&(
        <>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <TextInput label="Prénom" icon="user" value={form.firstName} onChange={set("firstName")} placeholder="Dieumerci" error={errors.firstName}/>
            <TextInput label="Nom" value={form.lastName} onChange={set("lastName")} placeholder="Kabila" error={errors.lastName}/>
          </div>
          <TextInput label="Email" icon="mail" type="email" value={form.email} onChange={set("email")} placeholder="dieu@swiin.app" error={errors.email}/>
          <TextInput label="Téléphone" icon="phone" value={form.phone} onChange={set("phone")} placeholder="+243 800 000 000"/>
          <Btn onClick={()=>{if(v1()) setStep(2);}}>Continuer</Btn>
        </>
      )}
      {step===2&&(
        <>
          <TextInput label="Mot de passe" icon="lock" type="password" value={form.password} onChange={set("password")} placeholder="Au moins 6 caractères" error={errors.password} hint="Utilisez lettres, chiffres et symboles."/>
          <TextInput label="Confirmer" icon="lock" type="password" value={form.confirmPassword} onChange={set("confirmPassword")} placeholder="Répétez" error={errors.confirmPassword}/>
          <Card style={{marginBottom:16}}>
            <div style={{fontSize:11,color:t.sec,lineHeight:1.7}}>En créant un compte, vous acceptez les <span style={{color:t.primary,fontWeight:600}}>Conditions d'utilisation</span> et la <span style={{color:t.primary,fontWeight:600}}>Politique de confidentialité</span> de SWIIN.</div>
          </Card>
          <Btn onClick={handleRegister}>Créer mon compte</Btn>
          <Btn v="ghost" onClick={()=>setStep(1)} style={{marginTop:8}}>Retour</Btn>
        </>
      )}
      <div style={{textAlign:"center",marginTop:16}}>
        <span style={{fontSize:12,color:t.sec}}>Déjà un compte ? </span>
        <span onClick={onLogin} style={{fontSize:12,color:t.primary,fontWeight:600,cursor:"pointer"}}>Se connecter</span>
      </div></div>);
}
function MerchantRegisterScreen({ onSuccess, onLogin }) {
  const {dark}=useTheme(); const t=Tk(dark);
  const {register,authError,clearError}=useAuth();
  const [step,setStep]=useState(1);
  const [errors,setErrors]=useState({});
  const [form,setForm]=useState({email:"",password:"",confirmPassword:"",businessName:"",merchantType:"",description:"",address:"",city:"",phone:"",paymentMethods:[],mobileProviders:[]});
  const set=k=>e=>{clearError();setErrors({});setForm(f=>({...f,[k]:e.target.value}));};
  const toggle=(field,val)=>setForm(f=>({...f,[field]:f[field].includes(val)?f[field].filter(x=>x!==val):[...f[field],val]}));

  const steps=["Compte","Boutique","Type","Paiement"];
  const vs={
    1:()=>{const e={};if(!form.email.includes("@"))e.email="Email invalide";if(form.password.length<6)e.password="Au moins 6 caractères";if(form.password!==form.confirmPassword)e.confirmPassword="Ne correspondent pas";setErrors(e);return Object.keys(e).length===0;},
    2:()=>{const e={};if(!form.businessName.trim())e.businessName="Requis";if(!form.merchantType)e.merchantType="Requis";setErrors(e);return Object.keys(e).length===0;},
    3:()=>true,
    4:()=>{const e={};if(form.paymentMethods.length===0)e.payment="Sélectionnez au moins un mode";setErrors(e);return Object.keys(e).length===0;},
  };

  const handleSubmit=()=>{
    if(!vs[4]()) return;
    const r=register({email:form.email,password:form.password,role:"merchant",
      extraData:{displayName:form.businessName,businessName:form.businessName,merchantType:form.merchantType,description:form.description,address:form.address,city:form.city,phone:form.phone,paymentMethods:form.paymentMethods,mobileProviders:form.mobileProviders}});
    if(r.success) onSuccess("merchant", r.uid, r.otpCode);
  };

  const slug=form.businessName.toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"")||"ma-boutique";

  return (
    <div style={{padding:"36px 22px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
        <div><Lbl style={{marginBottom:6}}>Espace marchand</Lbl><H size={22}>Créer ma boutique.</H></div>
        <ThemeToggle/></div>
      <div style={{display:"flex",gap:4,marginBottom:24}}>
        {steps.map((s,i)=>(
          <div key={s} style={{flex:1}}>
            <div style={{height:2,borderRadius:1,background:step>i?t.primary:t.line,marginBottom:4}}/>
            <div style={{fontSize:9,color:step===i+1?t.primary:t.tert,textAlign:"center",fontWeight:step===i+1?600:400}}>{s}</div>
          </div>
        ))}</div>
      <ErrorBanner message={authError} onDismiss={clearError}/>

      {step===1&&(<>
        <TextInput label="Email professionnel" icon="mail" type="email" value={form.email} onChange={set("email")} placeholder="contact@maboutique.com" error={errors.email}/>
        <TextInput label="Mot de passe" icon="lock" type="password" value={form.password} onChange={set("password")} placeholder="Au moins 6 caractères" error={errors.password}/>
        <TextInput label="Confirmer" icon="lock" type="password" value={form.confirmPassword} onChange={set("confirmPassword")} placeholder="Répétez" error={errors.confirmPassword}/>
        <Btn onClick={()=>{if(vs[1]()) setStep(2);}}>Continuer</Btn>
      </>)}

      {step===2&&(<>
        <TextInput label="Nom de la boutique" icon="store" value={form.businessName} onChange={set("businessName")} placeholder="Jordan Store, Barber Lux…" error={errors.businessName}/>
        {form.businessName&&(
          <Card style={{marginBottom:12}}>
            <Lbl style={{marginBottom:4}}>Votre lien SWIIN</Lbl>
            <div style={{fontSize:11,fontFamily:"monospace",color:t.sec,marginTop:4}}>swiin.app/store/{slug}</div>
          </Card>
        )}
        <SelectInput label="Type de commerce" icon="store" value={form.merchantType} onChange={set("merchantType")} options={MERCHANT_TYPES} error={errors.merchantType}/>
        <TextInput label="Description" value={form.description} onChange={set("description")} placeholder="Décrivez votre commerce…"/>
        <TextInput label="Adresse" icon="mappin" value={form.address} onChange={set("address")} placeholder="Av. Colonel Ebeya, Gombe"/>
        <TextInput label="Ville" value={form.city} onChange={set("city")} placeholder="Kinshasa"/>
        <TextInput label="Téléphone" icon="phone" value={form.phone} onChange={set("phone")} placeholder="+243 800 000 000"/>
        <div style={{display:"flex",gap:8}}>
          <Btn v="ghost" onClick={()=>setStep(1)} style={{flex:1}}>Retour</Btn>
          <Btn onClick={()=>{if(vs[2]()) setStep(3);}} style={{flex:2}}>Continuer</Btn></div>
      </>)}

      {step===3&&(<>
        {form.merchantType&&(()=>{
          const mt=MERCHANT_TYPES.find(x=>x.value===form.merchantType);
          return (
            <div style={{background:t.gL,border:`0.5px solid ${t.gM}`,borderRadius:14,padding:"14px 16px",marginBottom:16,display:"flex",alignItems:"center",gap:12}}>
              <Ico n={mt?.icon||"store"} size={20} color={t.green}/>
              <div>
                <div style={{fontSize:13,fontWeight:600,color:t.green}}>{mt?.label}</div>
                <div style={{fontSize:11,color:t.sec,marginTop:2}}>
                  {form.merchantType==="restaurant"&&"Ajoutez votre menu, plats et promotions."}
                  {form.merchantType==="barber"&&"Ajoutez vos services : coupes, barbe, soins."}
                  {form.merchantType==="salon"&&"Ajoutez vos prestations beauté et coiffure."}
                  {form.merchantType==="retail"&&"Ajoutez vos produits, catégories et stocks."}
                  {form.merchantType==="cafe"&&"Ajoutez votre menu boissons et formules."}
                  {form.merchantType==="hotel"&&"Ajoutez vos chambres, suites et services."}
                  {form.merchantType==="spa"&&"Ajoutez vos soins, massages et forfaits."}
                  {form.merchantType==="service"&&"Ajoutez vos prestations et tarifs."}</div></div></div>);
        })()}
        <Card style={{marginBottom:16}}>
          <Lbl style={{marginBottom:6}}>Vos produits & services</Lbl>
          <div style={{fontSize:12,color:t.sec,lineHeight:1.6,marginTop:4}}>Vous ajouterez votre catalogue complet depuis votre dashboard après création du compte.</div>
        </Card>
        <div style={{display:"flex",gap:8}}>
          <Btn v="ghost" onClick={()=>setStep(2)} style={{flex:1}}>Retour</Btn>
          <Btn onClick={()=>setStep(4)} style={{flex:2}}>Continuer</Btn></div>
      </>)}

      {step===4&&(<>
        <Lbl style={{marginBottom:12}}>Modes de paiement acceptés</Lbl>
        {[{id:"cash",label:"Espèces",sub:"Paiement en main propre",icon:"wallet"},{id:"mobile_money",label:"Mobile Money",sub:"Airtel · Orange · M-Pesa",icon:"phone"},{id:"card",label:"Visa / Mastercard",sub:"Paiement sécurisé",icon:"credit"}].map(pm=>{
          const sel=form.paymentMethods.includes(pm.id);
          return (
            <div key={pm.id} onClick={()=>toggle("paymentMethods",pm.id)}
              style={{padding:"13px 14px",borderRadius:14,cursor:"pointer",border:`0.5px solid ${sel?t.primary:t.line}`,background:sel?t.card2:"transparent",display:"flex",alignItems:"center",gap:12,transition:"all 0.2s",marginBottom:8}}>
              <div style={{width:38,height:38,borderRadius:10,background:sel?t.primary:t.card2,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <Ico n={pm.icon} size={16} color={sel?t.inv:t.sec}/></div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:600,color:t.primary}}>{pm.label}</div>
                <div style={{fontSize:11,color:t.sec}}>{pm.sub}</div></div>
              {sel&&<Ico n="check" size={16} color={t.green}/>}</div>);
        })}
        {form.paymentMethods.includes("mobile_money")&&(
          <Card style={{marginBottom:12}}>
            <Lbl style={{marginBottom:8}}>Opérateurs</Lbl>
            <div style={{display:"flex",gap:8}}>
              {["orange","airtel","mpesa"].map(op=>{
                const sel=form.mobileProviders.includes(op);
                return <button key={op} onClick={()=>toggle("mobileProviders",op)} style={{flex:1,padding:"9px 0",borderRadius:10,border:`0.5px solid ${sel?t.primary:t.line}`,background:sel?t.primary:"transparent",color:sel?t.inv:t.sec,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:F,textTransform:"capitalize"}}>{op}</button>;
              })}</div>
          </Card>
        )}
        {errors.payment&&<div style={{fontSize:11,color:t.red,marginBottom:10}}>{errors.payment}</div>}
        <div style={{display:"flex",gap:8}}>
          <Btn v="ghost" onClick={()=>setStep(3)} style={{flex:1}}>Retour</Btn>
          <Btn onClick={handleSubmit} style={{flex:2}}>Créer ma boutique</Btn></div>
      </>)}

      <div style={{textAlign:"center",marginTop:16}}>
        <span style={{fontSize:12,color:t.sec}}>Déjà un compte ? </span>
        <span onClick={onLogin} style={{fontSize:12,color:t.primary,fontWeight:600,cursor:"pointer"}}>Se connecter</span>
      </div></div>);
}
function SuperRegisterScreen({ onSuccess, onLogin }) {
  const {dark}=useTheme(); const t=Tk(dark);
  const {register,authError,clearError}=useAuth();
  const [errors,setErrors]=useState({});
  const [form,setForm]=useState({displayName:"",email:"",phone:"",password:"",confirmPassword:""});
  const set=k=>e=>{clearError();setErrors({});setForm(f=>({...f,[k]:e.target.value}));};

  const handleSubmit=()=>{
    const e={};
    if(!form.displayName.trim()) e.displayName="Requis";
    if(!form.email.includes("@")) e.email="Email invalide";
    if(form.password.length<6) e.password="Au moins 6 caractères";
    if(form.password!==form.confirmPassword) e.confirmPassword="Ne correspondent pas";
    setErrors(e); if(Object.keys(e).length>0) return;
    const r=register({email:form.email,password:form.password,role:"super_merchant",extraData:{displayName:form.displayName,phone:form.phone}});
    if(r.success) onSuccess("super_merchant", r.uid, r.otpCode);
  };

  return (
    <div style={{padding:"36px 22px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}><Ico n="zap" size={14} color={t.amber}/><Lbl style={{color:t.amber}}>Super Merchant</Lbl></div>
          <H size={22}>Votre réseau.</H></div>
        <ThemeToggle/></div>
      <div style={{background:t.aL,border:`0.5px solid ${t.amber}40`,borderRadius:14,padding:"13px 16px",marginBottom:20}}>
        <div style={{fontSize:12,color:t.amber,lineHeight:1.7}}>Gagnez <strong>20% des frais SWIIN</strong> générés par votre réseau. Qualification : <strong>20 marchands onboardés</strong>.</div>
      </div>
      <ErrorBanner message={authError} onDismiss={clearError}/>
      <TextInput label="Nom du réseau" icon="users" value={form.displayName} onChange={set("displayName")} placeholder="Kalume Network" error={errors.displayName}/>
      <TextInput label="Email" icon="mail" type="email" value={form.email} onChange={set("email")} placeholder="reseau@example.com" error={errors.email}/>
      <TextInput label="Téléphone" icon="phone" value={form.phone} onChange={set("phone")} placeholder="+243 800 000 000"/>
      <TextInput label="Mot de passe" icon="lock" type="password" value={form.password} onChange={set("password")} placeholder="Au moins 6 caractères" error={errors.password}/>
      <TextInput label="Confirmer" icon="lock" type="password" value={form.confirmPassword} onChange={set("confirmPassword")} placeholder="Répétez" error={errors.confirmPassword}/>
      <Btn v="amber" onClick={handleSubmit}>Créer mon compte Super Merchant</Btn>
      <div style={{textAlign:"center",marginTop:16}}>
        <span style={{fontSize:12,color:t.sec}}>Déjà un compte ? </span>
        <span onClick={onLogin} style={{fontSize:12,color:t.primary,fontWeight:600,cursor:"pointer"}}>Se connecter</span>
      </div></div>);
}
const PRODUCTS_DATA = [
  { id:"p1", name:"Crocs Classic", merchant:"Jordan Store", price:35, commission:10, category:"Mode", stock:42, desc:"Confort absolu, style universel." },
  { id:"p2", name:"Lattafa Perfume", merchant:"Luxe Afrique", price:48, commission:8, category:"Beauté", stock:18, desc:"Fragrance orientale de luxe." },
  { id:"p3", name:"iPhone 15", merchant:"TechHub DRC", price:780, commission:5, category:"Tech", stock:7, desc:"Débloqué tout opérateur." },
  { id:"p4", name:"Air Jordan 1 Retro", merchant:"Sneaker Palace", price:220, commission:9, category:"Mode", stock:12, desc:"Authenticité 100% garantie." },
  { id:"p5", name:"Coupe premium + Barbe", merchant:"Barber Lux", price:22, commission:12, category:"Beauté", stock:99, desc:"Coupe complète + finitions rasoir." },
  { id:"p6", name:"Poulet moambe", merchant:"Saveurs du Congo", price:12, commission:8, category:"Restaurant", stock:30, desc:"Plat signature aux feuilles de palmier." },
];
const USD_TO_CDF = 2850;
let SHARED_WITHDRAWALS = [
  {
    id:"WD-001", customerId:"usr_customer", customerName:"Dieumerci K.",
    merchant:"Jordan Store", amount:20.00, currency:"USD",
    date:"5 juin 2026", method:"mobile_money", provider:"orange",
    number:"+243812345678", status:"completed", code:"SW-48291", codeUsed:true,
  },
  {
    id:"WD-002", customerId:"usr_customer", customerName:"Dieumerci K.",
    merchant:"Barber Lux", amount:8.50, currency:"USD",
    date:"3 juin 2026", method:"cash", provider:null,
    number:null, status:"approved", code:"SW-73921", codeUsed:false,
  },
  {
    id:"WD-003", customerId:"usr_customer", customerName:"Dieumerci K.",
    merchant:"Saveurs du Congo", amount:15000, currency:"CDF",
    date:"2 juin 2026", method:"mobile_money", provider:"airtel",
    number:"+243823456789", status:"pending", code:null, codeUsed:false,
  },
  {
    id:"WD-004", customerId:"usr_customer", customerName:"Dieumerci K.",
    merchant:"Glam Studio", amount:10.00, currency:"USD",
    date:"1 juin 2026", method:"mobile_money", provider:"mpesa",
    number:"+243812345678", status:"rejected", code:null, codeUsed:false,
    rejectedReason:"Commissions insuffisantes — veuillez vérifier votre balance.",
  },
];
const SharedDB = {
  getWithdrawals: () => SHARED_WITHDRAWALS,
  addWithdrawal: (wd) => { SHARED_WITHDRAWALS = [wd, ...SHARED_WITHDRAWALS]; },
  approveWithdrawal: (id, code) => {
    SHARED_WITHDRAWALS = SHARED_WITHDRAWALS.map(w =>
      w.id===id ? { ...w, status:"approved", code, codeUsed:false } : w);
  },
  completeWithdrawal: (id) => {
    SHARED_WITHDRAWALS = SHARED_WITHDRAWALS.map(w =>
      w.id===id ? { ...w, status:"completed", codeUsed:true } : w);
  },
  rejectWithdrawal: (id) => {
    SHARED_WITHDRAWALS = SHARED_WITHDRAWALS.map(w =>
      w.id===id ? { ...w, status:"rejected" } : w);
  },
  validateCode: (id, inputCode) => {
    const wd = SHARED_WITHDRAWALS.find(w=>w.id===id);
    if (!wd) return false;
    if (wd.codeUsed) return false;
    return wd.code === inputCode.toUpperCase().trim();
  },
};
let OTP_STORE = {};
let FEE_PAYMENT_SUBMISSIONS = [
  { id:"FPS-001", uid:"usr_customer", name:"Dieumerci K.", amount:6.61, network:"orange",
    txId:"IC260513.1346.E03861", txName:"DIEUMERCI KABILA", txDate:"12 juin 2026",
    status:"pending", submittedAt:"12 juin 2026 14:32" },
  { id:"FPS-002", uid:"usr_customer2", name:"Amina B.", amount:3.20, network:"airtel",
    txId:"AT260510.0922.B17432", txName:"AMINA BAKALA", txDate:"10 juin 2026",
    status:"validated", submittedAt:"10 juin 2026 09:22" },
];
let MERCHANT_VERIFICATIONS = [];
const SWIIN_MM_NUMBERS = [
  { id:"orange", label:"Orange Money", number:"+243 899 000 001", name:"SWIIN TECH SARL", active:true },
  { id:"airtel",  label:"Airtel Money",  number:"+243 810 000 002", name:"SWIIN TECH SARL", active:true },
  { id:"mpesa",   label:"M-Pesa",        number:"+243 820 000 003", name:"SWIIN TECH SARL", active:true },
  { id:"africell",label:"Africell Money",number:"+243 830 000 004", name:"SWIIN TECH SARL", active:false },
];

// ─────────────────────────────────────────────────────────────────────────────
// SHARED ORDERS DB — connexion Explorer (créateur) ↔ Commandes (marchand)
// ─────────────────────────────────────────────────────────────────────────────
let SHARED_ORDERS = [
  {
    id:"ORD-DEMO-001",
    creatorId:"usr_customer", creatorName:"Dieumerci K.",
    merchantId:"mrc_jordan", merchantName:"Jordan Store",
    productId:"p4", productName:"Air Jordan 1 Retro",
    price:220, currency:"USD", commission:9,
    status:"pending",
    date:"Aujourd'hui", time:"11:05",
  },
  {
    id:"ORD-DEMO-002",
    creatorId:"usr_customer", creatorName:"Dieumerci K.",
    merchantId:"mrc_barber", merchantName:"Barber Lux",
    productId:"p5a", productName:"Coupe premium",
    price:15, currency:"USD", commission:12,
    status:"validated",
    date:"Hier", time:"14:22",
  },
  {
    id:"ORD-DEMO-003",
    creatorId:"usr_customer", creatorName:"Dieumerci K.",
    merchantId:"mrc_saveurs", merchantName:"Saveurs du Congo",
    productId:"p6a", productName:"Poulet moambe",
    price:54000, currency:"CDF", commission:8,
    status:"rejected",
    rejectedReason:"Achat non reconnu",
    date:"Avant-hier", time:"19:30",
  },
];

const SharedOrdersDB = {
  getAll:        ()=>SHARED_ORDERS,
  getByCreator:  (uid)=>SHARED_ORDERS.filter(o=>o.creatorId===uid),
  getByMerchant: (mid)=>SHARED_ORDERS.filter(o=>o.merchantId===mid),
  add: (order)=>{ SHARED_ORDERS=[order,...SHARED_ORDERS]; },
  validate: (id)=>{
    SHARED_ORDERS=SHARED_ORDERS.map(o=>o.id===id?{...o,status:"validated"}:o);
  },
  reject: (id, reason)=>{
    SHARED_ORDERS=SHARED_ORDERS.map(o=>o.id===id?{...o,status:"rejected",rejectedReason:reason}:o);
  },
};

const OtpDB = {
  generate(uid) {
    const code = String(Math.floor(100000+Math.random()*900000));
    OTP_STORE[uid] = { code, expiresAt: Date.now()+5*60*1000, attempts:0 };
    return code;
  },
  validate(uid, input) {
    const entry = OTP_STORE[uid];
    if (!entry) return {ok:false, reason:"expired"};
    if (Date.now() > entry.expiresAt) return {ok:false, reason:"expired"};
    if (entry.attempts >= 3) return {ok:false, reason:"locked"};
    entry.attempts++;
    if (entry.code === String(input).trim()) {
      delete OTP_STORE[uid];
      return {ok:true};
    }
    return {ok:false, reason:"invalid"};
  },
  getCode(uid) { return OTP_STORE[uid]?.code || null; },
  getExpiry(uid) { return OTP_STORE[uid]?.expiresAt || null; },
};

const FeePaymentsDB = {
  getAll: ()=>FEE_PAYMENT_SUBMISSIONS,
  getByUid: (uid)=>FEE_PAYMENT_SUBMISSIONS.filter(f=>f.uid===uid),
  submit: (submission)=>{ FEE_PAYMENT_SUBMISSIONS=[submission,...FEE_PAYMENT_SUBMISSIONS]; },
  validate: (id)=>{ FEE_PAYMENT_SUBMISSIONS=FEE_PAYMENT_SUBMISSIONS.map(f=>f.id===id?{...f,status:"validated"}:f); },
  reject: (id, reason)=>{ FEE_PAYMENT_SUBMISSIONS=FEE_PAYMENT_SUBMISSIONS.map(f=>f.id===id?{...f,status:"rejected",rejectReason:reason}:f); },
};
const COMMISSIONS_DATA = [
  {id:"c1",buyerName:"Jordan K.",buyerInitials:"JK",product:"Crocs Classic",merchant:"Jordan Store",merchantIcon:"store",orderAmount:35,currency:"USD",commissionRate:10,commGross:3.50,fee:0.35,net:3.15,status:"available",date:"12 juin 2026",time:"14:32",source:"whatsapp"},
  {id:"c2",buyerName:"Amina B.",buyerInitials:"AB",product:"Coupe premium + Barbe",merchant:"Barber Lux",merchantIcon:"scissors",orderAmount:22,currency:"USD",commissionRate:12,commGross:2.64,fee:0.264,net:2.376,status:"available",date:"11 juin 2026",time:"10:15",source:"instagram"},
  {id:"c3",buyerName:"Patrick M.",buyerInitials:"PM",product:"Poulet moambe",merchant:"Saveurs du Congo",merchantIcon:"utensils",orderAmount:54000,currency:"CDF",commissionRate:8,commGross:4320,fee:432,net:3888,status:"available",date:"10 juin 2026",time:"19:47",source:"tiktok"},
  {id:"c4",buyerName:"Esther L.",buyerInitials:"EL",product:"Tressage knotless",merchant:"Glam Studio",merchantIcon:"sparkle",orderAmount:45,currency:"USD",commissionRate:12,commGross:5.40,fee:0.54,net:4.86,status:"pending",date:"10 juin 2026",time:"11:22",source:"whatsapp"},
  {id:"c5",buyerName:"Junior N.",buyerInitials:"JN",product:"iPhone 15",merchant:"TechHub DRC",merchantIcon:"store",orderAmount:780,currency:"USD",commissionRate:5,commGross:39.00,fee:3.90,net:35.10,status:"locked",date:"9 juin 2026",time:"16:08",source:"facebook"},
  {id:"c6",buyerName:"Marie K.",buyerInitials:"MK",product:"Brunch premium",merchant:"Le Cafe Central",merchantIcon:"coffee",orderAmount:54000,currency:"CDF",commissionRate:10,commGross:5400,fee:540,net:4860,status:"available",date:"8 juin 2026",time:"09:30",source:"tiktok"},
  {id:"c7",buyerName:"Freddy M.",buyerInitials:"FM",product:"Burger Combo Deluxe",merchant:"Saveurs du Congo",merchantIcon:"utensils",orderAmount:51300,currency:"CDF",commissionRate:15,commGross:7695,fee:769.5,net:6925.5,status:"available",date:"7 juin 2026",time:"13:05",source:"instagram"},
  {id:"c8",buyerName:"Sarah K.",buyerInitials:"SK",product:"Air Jordan 1 Retro",merchant:"Jordan Store",merchantIcon:"store",orderAmount:220,currency:"USD",commissionRate:9,commGross:19.80,fee:1.98,net:17.82,status:"available",date:"6 juin 2026",time:"17:20",source:"whatsapp"},
];

const STATUS_COMM_LABEL = {
  available:"Disponible", pending:"En attente validation", locked:"Verrouille", withdrawn:"Retire"
};
const STATUS_COMM_COLOR = {
  available:"green", pending:"amber", locked:"red", withdrawn:"purple"
};
const computeBalances = (comms, withdrawals) => {
  const balances = {};
  comms.filter(c=>c.status==="available").forEach(c=>{
    const key = c.merchant + "|" + c.currency;
    if(!balances[key]) balances[key]={ merchant:c.merchant, currency:c.currency, available:0, pending:0, withdrawn:0, total:0 };
    balances[key].available += c.net;
    balances[key].total     += c.net;
  });
  comms.filter(c=>c.status==="pending").forEach(c=>{
    const key = c.merchant + "|" + c.currency;
    if(!balances[key]) balances[key]={ merchant:c.merchant, currency:c.currency, available:0, pending:0, withdrawn:0, total:0 };
    balances[key].pending += c.net;
  });
  (withdrawals||[]).filter(w=>w.status==="completed").forEach(w=>{
    const key = w.merchant + "|" + w.currency;
    if(balances[key]) {
      balances[key].available -= w.amount;
      balances[key].withdrawn += w.amount;
    }
  });
  return Object.values(balances);
};

const REFERRAL_LINKS = [
  {
    id:"l1", product:"Crocs Classic", merchant:"Jordan Store", merchantType:"retail",
    shortUrl:"swiin.app/r/dieumk-crocs", slug:"dieumk-crocs",
    clicks:127, conversions:8, net:28.00, currency:"USD", status:"active",
    unlockedAt:"5 juin 2026",
    sales:[
      {buyer:"Jordan K.",initials:"JK",date:"12 juin",amount:35,commission:3.15,source:"whatsapp"},
      {buyer:"Sarah K.",initials:"SK",date:"6 juin",amount:35,commission:3.15,source:"whatsapp"},
      {buyer:"Celine M.",initials:"CM",date:"4 juin",amount:35,commission:3.15,source:"instagram"},
      {buyer:"Eric N.",initials:"EN",date:"2 juin",amount:35,commission:3.15,source:"tiktok"},
      {buyer:"Lea B.",initials:"LB",date:"1 juin",amount:35,commission:3.15,source:"whatsapp"},
      {buyer:"Marc K.",initials:"MK",date:"28 mai",amount:35,commission:3.15,source:"facebook"},
      {buyer:"Amina D.",initials:"AD",date:"25 mai",amount:35,commission:3.15,source:"whatsapp"},
      {buyer:"Paul M.",initials:"PM",date:"20 mai",amount:35,commission:3.15,source:"instagram"},
    ],
  },
  {
    id:"l2", product:"Coupe premium + Barbe", merchant:"Barber Lux", merchantType:"barber",
    shortUrl:"swiin.app/r/dieumk-coupe", slug:"dieumk-coupe",
    clicks:84, conversions:5, net:11.88, currency:"USD", status:"active",
    unlockedAt:"3 juin 2026",
    sales:[
      {buyer:"Amina B.",initials:"AB",date:"11 juin",amount:22,commission:2.376,source:"instagram"},
      {buyer:"Jules K.",initials:"JK",date:"8 juin",amount:22,commission:2.376,source:"whatsapp"},
      {buyer:"Remy N.",initials:"RN",date:"5 juin",amount:22,commission:2.376,source:"tiktok"},
      {buyer:"Diana L.",initials:"DL",date:"3 juin",amount:22,commission:2.376,source:"whatsapp"},
      {buyer:"Chris M.",initials:"CM",date:"1 juin",amount:22,commission:2.376,source:"instagram"},
    ],
  },
  {
    id:"l3", product:"Poulet moambe", merchant:"Saveurs du Congo", merchantType:"restaurant",
    shortUrl:"swiin.app/r/dieumk-moambe", slug:"dieumk-moambe",
    clicks:61, conversions:3, net:11661, currency:"CDF", status:"active",
    unlockedAt:"1 juin 2026",
    sales:[
      {buyer:"Patrick M.",initials:"PM",date:"10 juin",amount:54000,commission:3888,source:"tiktok"},
      {buyer:"Freddy M.",initials:"FM",date:"7 juin",amount:54000,commission:3888,source:"instagram"},
      {buyer:"Nina K.",initials:"NK",date:"5 juin",amount:54000,commission:3885,source:"whatsapp"},
    ],
  },
  {
    id:"l4", product:"iPhone 15", merchant:"TechHub DRC", merchantType:"retail",
    shortUrl:"swiin.app/r/dieumk-iphone", slug:"dieumk-iphone",
    clicks:42, conversions:1, net:35.10, currency:"USD", status:"locked",
    unlockedAt:"9 juin 2026",
    sales:[
      {buyer:"Junior N.",initials:"JN",date:"9 juin",amount:780,commission:35.10,source:"facebook"},
    ],
  },
  {
    id:"l5", product:"Tressage knotless XL", merchant:"Glam Studio", merchantType:"salon",
    shortUrl:"swiin.app/r/dieumk-tresse", slug:"dieumk-tresse",
    clicks:0, conversions:0, net:0, currency:"USD", status:"pending",
    unlockedAt:null,
    pendingSince:"Aujourd'hui 11:22",
    sales:[],
  },
  {
    id:"l6", product:"Massage relaxant 60min", merchant:"Spa Lumière", merchantType:"spa",
    shortUrl:"swiin.app/r/dieumk-massage", slug:"dieumk-massage",
    clicks:0, conversions:0, net:0, currency:"USD", status:"rejected",
    unlockedAt:null,
    rejectedAt:"Hier",
    rejectedReason:"Achat non reconnu par le marchand",
    sales:[],
  },
];

const MERCHANT_ORDERS = [
  { id:"ORD-001", customer:"Marie K.", product:"Crocs Classic", amount:35, date:"Aujourd'hui 14:20", validated:false },
  { id:"ORD-002", customer:"Patrick M.", product:"Lattafa Perfume", amount:48, date:"Aujourd'hui 11:05", validated:false },
  { id:"ORD-003", customer:"Esther L.", product:"Crocs Classic", amount:35, date:"Hier 18:42", validated:true },
  { id:"ORD-004", customer:"Junior N.", product:"Air Jordan 1 Retro", amount:220, date:"Hier 10:30", validated:true },
  { id:"ORD-005", customer:"Sarah K.", product:"Lattafa Perfume", amount:48, date:"Il y a 2j", validated:true },
];
const MERCHANT_WITHDRAWAL_REQUESTS = [
  { id:"MWD-001", customer:"Dieumerci K.", amount:45.00, currency:"USD", method:"mobile_money", provider:"orange", number:"+243812345678", date:"Aujourd'hui", status:"pending", code:null,
    breakdown:[
      { product:"Crocs Classic", orderAmt:35, rate:10, comm:3.15, date:"12 juin", source:"whatsapp" },
      { product:"Air Jordan 1",  orderAmt:220, rate:9, comm:17.82, date:"6 juin",  source:"whatsapp" },
      { product:"Crocs Classic", orderAmt:35, rate:10, comm:3.15, date:"4 juin",  source:"instagram" },
    ],
    totalGenerated:65.00, alreadyWithdrawn:20.00, available:45.00,
  },
  { id:"MWD-002", customer:"Amina B.", amount:14.00, currency:"USD", method:"cash", provider:null, number:null, date:"Hier", status:"approved", code:"SW-82947",
    breakdown:[
      { product:"Coupe + Barbe", orderAmt:22, rate:12, comm:2.376, date:"11 juin", source:"instagram" },
    ],
    totalGenerated:18.50, alreadyWithdrawn:0, available:18.50,
  },
];

const ADMIN_USERS_DATA = [
  { uid:"usr_customer", name:"Dieumerci Kabila", email:"client@swiin.app", role:"customer", status:"active", joined:"15 jan 2026", earned:"$59.52", fees:"$6.61" },
  { uid:"usr_2", name:"Amina Bokata", email:"amina@swiin.app", role:"customer", status:"pending_fees", joined:"8 fév 2026", earned:"$34.80", fees:"$3.87" },
  { uid:"usr_3", name:"Patrick Moke", email:"pat@swiin.app", role:"customer", status:"active", joined:"10 mar 2026", earned:"$203.10", fees:"$22.57" },
];

const ADMIN_MERCHANTS_DATA = [
  { id:"mrc_jordan", name:"Jordan Store", type:"retail", status:"active", verified:true, revenue:"$2 410", fees:"$241", affiliates:34 },
  { id:"mrc_barber", name:"Barber Lux", type:"barber", status:"active", verified:true, revenue:"$1 200", fees:"$120", affiliates:18 },
  { id:"mrc_restaurant", name:"Saveurs du Congo", type:"restaurant", status:"active", verified:false, revenue:"$980", fees:"$98", affiliates:12 },
  { id:"mrc_glam", name:"Glam Studio", type:"salon", status:"active", verified:true, revenue:"$1 840", fees:"$184", affiliates:22 },
];

const FEE_PAYMENTS = [
  { id:"FP-001", user:"Dieumerci K.", amount:4.50, date:"Aujourd'hui", method:"Orange Money", status:"pending", proof:"Reçu #8821" },
  { id:"FP-002", user:"Amina B.", amount:3.87, date:"Hier", method:"Cash", status:"pending", proof:"Bureau KIN" },
  { id:"FP-003", user:"Freddy M.", amount:12.40, date:"Il y a 2j", method:"M-Pesa", status:"approved", proof:"Reçu #4419" },
];

const genCode = () => `SW-${Math.floor(10000 + Math.random() * 89999)}`;
const MERCHANTS_CATALOG = [
  {
    id:"mrc_jordan", name:"Jordan Store", slug:"jordan-store", type:"retail",
    desc:"Sneakers & mode urbaine premium. Nike, Jordan, Adidas.",
    city:"Kinshasa-Gombe", phone:"+243898765432", rating:4.8, ratingCount:127,
    verified:true, affiliates:34,
    products:[
      {id:"p1",name:"Crocs Classic",price:35,currency:"USD",commission:10,stock:42,desc:"Confort absolu, style universel."},
      {id:"p4",name:"Air Jordan 1 Retro",price:220,currency:"USD",commission:9,stock:12,desc:"Authenticite 100% garantie."},
      {id:"p7",name:"Lattafa Perfume",price:48,currency:"USD",commission:8,stock:18,desc:"Fragrance orientale de luxe."},
    ],
  },
  {
    id:"mrc_barber", name:"Barber Lux", slug:"barber-lux", type:"barber",
    desc:"Barbershop haut de gamme. Coupes, barbes et soins du cuir chevelu.",
    city:"Kinshasa-Gombe", phone:"+243811234567", rating:4.9, ratingCount:89,
    verified:true, affiliates:18,
    products:[
      {id:"p5a",name:"Coupe premium",price:15,currency:"USD",commission:12,stock:99,desc:"Coupe + finitions rasoir."},
      {id:"p5b",name:"Barbe sculptee",price:10,currency:"USD",commission:12,stock:99,desc:"Taille et modelage de barbe."},
      {id:"p5c",name:"Pack Coupe + Barbe",price:22,currency:"USD",commission:12,stock:99,desc:"Service complet en 45 min."},
    ],
  },
  {
    id:"mrc_saveurs", name:"Saveurs du Congo", slug:"saveurs-congo", type:"restaurant",
    desc:"Cuisine congolaise raffineee. Menu du jour, livraison & reservation de table.",
    city:"Kinshasa-Lingwala", phone:"+243823456789", rating:4.7, ratingCount:203,
    verified:false, affiliates:12,
    products:[
      {id:"p6a",name:"Poulet moambe",currency:"CDF",price:12,currency:"USD",commission:8,stock:30,desc:"Plat signature, feuilles de palmier."},
      {id:"p6b",name:"Poisson braise",currency:"CDF",price:18,currency:"USD",commission:8,stock:20,desc:"Tilapia frais, marinade maison."},
      {id:"p6c",name:"Fufu & Saka-saka",currency:"CDF",price:9,currency:"USD",commission:8,stock:40,desc:"Tradition congolaise authentique."},
    ],
  },
  {
    id:"mrc_glam", name:"Glam Studio", slug:"glam-studio", type:"salon",
    desc:"Salon de beaute & hair studio. Tressage, soins, maquillage.",
    city:"Kinshasa-Kalamu", phone:"+243834567890", rating:4.9, ratingCount:156,
    verified:true, affiliates:22,
    products:[
      {id:"p8a",name:"Tressage knotless XL",price:40,currency:"USD",commission:12,stock:99,desc:"Box braids, knotless, all styles."},
      {id:"p8b",name:"Soin keratine",price:35,currency:"USD",commission:12,stock:99,desc:"Lissage professionnel longue duree."},
      {id:"p8c",name:"Maquillage evenement",price:50,currency:"USD",commission:12,stock:99,desc:"Mariages, soirees, shootings."},
    ],
  },
  {
    id:"mrc_cafe", name:"Le Cafe Central", slug:"cafe-central", type:"cafe",
    desc:"Cafe, patisseries artisanales et espace coworking au coeur de Gombe.",
    city:"Kinshasa-Gombe", phone:"+243845678901", rating:4.6, ratingCount:74,
    verified:true, affiliates:9,
    products:[
      {id:"p9a",name:"Cafe signature",currency:"CDF",price:4,currency:"USD",commission:10,stock:99,desc:"Blend maison, torrefaction locale."},
      {id:"p9b",name:"Brunch premium",currency:"CDF",price:18,currency:"USD",commission:10,stock:15,desc:"Formule complete + boisson."},
      {id:"p9c",name:"Pack coworking",currency:"CDF",price:25,currency:"USD",commission:10,stock:10,desc:"Journee + cafe illimite + Wi-Fi."},
    ],
  },
  {
    id:"mrc_tech", name:"TechHub DRC", slug:"techhub-drc", type:"retail",
    desc:"Smartphones, accessoires et reparation. Garantie officielle.",
    city:"Kinshasa-Ngaliema", phone:"+243856789012", rating:4.5, ratingCount:312,
    verified:false, affiliates:41,
    products:[
      {id:"p3a",name:"iPhone 15 256GB",price:780,currency:"USD",commission:5,stock:7,desc:"Debloque tout operateur."},
      {id:"p3b",name:"Samsung S24",price:650,currency:"USD",commission:5,stock:12,desc:"Galaxy S24 neuf, garanti 1 an."},
      {id:"p3c",name:"AirPods Pro",price:180,currency:"USD",commission:6,stock:25,desc:"Authentiques, boite scellee."},
    ],
  },
  {
    id:"mrc_spa", name:"Spa Lumiere", slug:"spa-lumiere", type:"spa",
    desc:"Massages, soins du corps et rituels bien-etre. Reservation en ligne.",
    city:"Kinshasa-Gombe", phone:"+243867890123", rating:4.8, ratingCount:58,
    verified:true, affiliates:7,
    products:[
      {id:"p10a",name:"Massage relaxant 60min",price:35,currency:"USD",commission:12,stock:99,desc:"Huiles essentielles, ambiance zen."},
      {id:"p10b",name:"Soin visage premium",price:28,currency:"USD",commission:12,stock:99,desc:"Nettoyage + hydratation profonde."},
      {id:"p10c",name:"Forfait duo",price:60,currency:"USD",commission:12,stock:10,desc:"2 massages + soin visage."},
    ],
  },
  {
    id:"mrc_hotel", name:"Hotel Presidence", slug:"hotel-presidence", type:"hotel",
    desc:"Hotel 4 etoiles, vue panoramique sur le fleuve Congo.",
    city:"Kinshasa-Gombe", phone:"+243878901234", rating:4.7, ratingCount:445,
    verified:true, affiliates:15,
    products:[
      {id:"p11a",name:"Suite junior — 1 nuit",price:120,currency:"USD",commission:7,stock:5,desc:"Vue panoramique, petit-dejeuner."},
      {id:"p11b",name:"Chambre standard",price:65,currency:"USD",commission:7,stock:12,desc:"Confort moderne, acces piscine."},
      {id:"p11c",name:"Diner gastronomique",price:45,currency:"USD",commission:8,stock:20,desc:"Menu 3 services, chef."},
    ],
  },
];

const TYPE_META = {
  retail:    { label:"Boutique",    icon:"store",    color:"purple" },
  barber:    { label:"Barbershop",  icon:"scissors", color:"amber" },
  restaurant:{ label:"Restaurant",  icon:"utensils", color:"red" },
  salon:     { label:"Salon",       icon:"sparkle",  color:"green" },
  cafe:      { label:"Cafe",        icon:"coffee",   color:"amber" },
  spa:       { label:"Spa",         icon:"zap",      color:"purple" },
  hotel:     { label:"Hotel",       icon:"home",     color:"green" },
  service:   { label:"Service",     icon:"globe",    color:"red" },
};
function BottomNav({ tabs, active, onSelect }) {
  const {dark}=useTheme(); const t=Tk(dark);
  return (
    <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:t.navBg,backdropFilter:"blur(24px)",borderTop:`0.5px solid ${t.line}`,display:"flex",zIndex:100,paddingBottom:10,paddingTop:4}}>
      {tabs.map(tb=>{
        const on=active===tb.id;
        return (
          <div key={tb.id} onClick={()=>onSelect(tb.id)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"8px 4px 4px",cursor:"pointer"}}>
            <Ico n={tb.icon} size={20} color={on?t.primary:t.tert} sw={on?2:1.5}/>
            <span style={{fontSize:9,fontWeight:on?600:400,color:on?t.primary:t.tert}}>{tb.label}</span>
            {on&&<div style={{position:"absolute",bottom:8,width:4,height:4,borderRadius:2,background:t.green}}/>}
          </div>);
      })}</div>);
}

function PageHeader({ title, subtitle, right }) {
  const {dark}=useTheme(); const t=Tk(dark);
  return (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
      <div>
        {subtitle&&<Lbl style={{marginBottom:4}}>{subtitle}</Lbl>}
        <H size={22}>{title}</H></div>
      {right}</div>);
}

function StatCard({ label, value, color, sub }) {
  const {dark}=useTheme(); const t=Tk(dark);
  return (
    <Card>
      <Lbl>{label}</Lbl>
      <div style={{fontSize:22,fontWeight:700,color:color||t.primary,marginTop:5,letterSpacing:-0.5}}>{value}</div>
      {sub&&<div style={{fontSize:10,color:t.sec,marginTop:2}}>{sub}</div>}
    </Card>);
}

function MiniBar({ data }) {
  const {dark}=useTheme(); const t=Tk(dark);
  const mx=Math.max(...data);
  return (
    <div style={{display:"flex",alignItems:"flex-end",gap:3,height:40}}>
      {data.map((v,i)=><div key={i} style={{flex:1,borderRadius:3,background:dark?`rgba(255,255,255,${0.06+(v/mx)*0.22})`:`rgba(0,0,0,${0.06+(v/mx)*0.22})`,height:`${Math.max(8,(v/mx)*100)}%`}}/>)}
    </div>);
}

const STATUS_CFG = {
  paid:{label:"Payé",color:"green"},
  confirmed:{label:"Confirmé",color:"green"},
  pending:{label:"En attente",color:"amber"},
  locked:{label:"Verrouillé",color:"red"},
  active:{label:"Actif",color:"green"},
  suspended:{label:"Suspendu",color:"red"},
  pending_fees:{label:"Frais dus",color:"amber"},
};

const SRC_CFG = {
  whatsapp:{label:"WhatsApp",color:"#25D366"},
  instagram:{label:"Instagram",color:"#E4405F"},
  tiktok:{label:"TikTok",color:"#888"},
  facebook:{label:"Facebook",color:"#1877F2"},
};

function CommissionRow({ c, onClick }) {
  const {dark}=useTheme(); const t=Tk(dark);
  const sc=STATUS_CFG[c.status]||STATUS_CFG.pending;
  const src=SRC_CFG[c.source]||{label:c.source,color:t.sec};
  return (
    <Card onClick={onClick} style={{marginBottom:8,border:`0.5px solid ${c.status==="locked"?t.red+"30":c.status==="pending"?t.amber+"20":t.line}`}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
        <div style={{width:38,height:38,borderRadius:"50%",background:t.card2,border:`0.5px solid ${t.line2}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <span style={{fontSize:11,fontWeight:700,color:t.sec}}>{c.buyerInitials}</span></div>
        <div style={{flex:1}}>
          <div style={{fontSize:13,fontWeight:600,color:t.primary}}>{c.buyerName}</div>
          <div style={{fontSize:10,color:t.sec}}>{c.product} · {c.date}</div></div>
        <div style={{textAlign:"right",flexShrink:0}}>
          <div style={{fontSize:15,fontWeight:800,color:t.primary}}>+${c.net.toFixed(2)}</div>
          <div style={{fontSize:10,color:t.sec,textDecoration:"line-through"}}>${c.commGross.toFixed(2)}</div></div>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:5}}>
          <div style={{width:6,height:6,borderRadius:"50%",background:src.color}}/>
          <span style={{fontSize:10,color:t.sec}}>{src.label}</span></div>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <span style={{fontSize:10,color:t.amber}}>−${c.fee.toFixed(2)}</span>
          <Chip label={sc.label} color={sc.color}/></div></div>
    </Card>);
}
function CustomerHome({ finances, onExplore, onGoWallet, onGoWithdraw, onFeeSubmitted }) {
  const {dark}=useTheme(); const t=Tk(dark);
  const {profile}=useAuth();
  const { totalAvailableUSD, weekEarnings, monthEarnings, unpaidFees, liveWithdrawals, feeStatus, walletCurrency, hideBalance, setHideBalance } = finances;
  const firstName = profile?.firstName || profile?.displayName?.split(' ')[0] || 'vous';
  const fmtMain=(v)=>walletCurrency==="CDF"?`${Math.round(v*USD_TO_CDF).toLocaleString()} FC`:`~$${v.toFixed(2)}`;
  const [showFeesPay,setShowFeesPay]=useState(false);
  const hasDebt = feeStatus==='unpaid';
  const pendingWithdrawals = liveWithdrawals.filter(w=>w.status==="pending"||w.status==="approved");
  const pendingWdTotal = pendingWithdrawals.reduce((s,w)=>s+(w.currency==="CDF"?w.amount/USD_TO_CDF:w.amount),0);
  const hasApproved = pendingWithdrawals.some(w=>w.status==="approved");

  return (
    <div style={{padding:"20px 16px 100px"}}>
      {}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div><Lbl style={{marginBottom:3}}>ACCUEIL</Lbl><H size={22}>Bonjour, {firstName} 👋</H></div>
        <ThemeToggle/></div>

      {}
      {hasApproved&&(
        <div onClick={onGoWithdraw}
          style={{background:t.gL,border:`1px solid ${t.green}`,borderRadius:16,padding:"14px 16px",marginBottom:14,cursor:"pointer",display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:36,height:36,borderRadius:10,background:t.green,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <Ico n="check" size={18} color="#000" sw={2.5}/></div>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:700,color:t.green}}>Un retrait a été approuvé</div>
            <div style={{fontSize:11,color:t.green,opacity:0.85,marginTop:1}}>Votre code est disponible — confirmez maintenant</div>
          </div>
          <Ico n="arR" size={16} color={t.green}/></div>
      )}

      {}
      <div onClick={onGoWallet}
        style={{background:t.card,border:`0.5px solid ${t.line}`,borderRadius:22,padding:22,marginBottom:14,boxShadow:t.shadow,position:"relative",overflow:"hidden",cursor:"pointer"}}>
        {dark&&<div style={{position:"absolute",top:-40,right:-40,width:130,height:130,borderRadius:"50%",background:`radial-gradient(circle,${t.gL},transparent 70%)`,pointerEvents:"none"}}/>}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
          <Lbl>Solde disponible</Lbl>
          <div style={{display:"flex",alignItems:"center",gap:8}} onClick={e=>{e.stopPropagation();setHideBalance(h=>!h);}}>
            <Ico n={hideBalance?"eye":"eyeOff"} size={15} color={t.sec}/>
            <Ico n="arR" size={13} color={t.tert}/>
          </div>
        </div>
        <div style={{fontSize:40,fontWeight:800,letterSpacing:-2,color:t.primary,marginBottom:14,filter:hideBalance?"blur(12px)":"none",userSelect:hideBalance?"none":"auto",transition:"filter 0.2s"}}>
          {fmtMain(totalAvailableUSD)}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          <div style={{background:t.card2,borderRadius:12,padding:"10px 8px"}}>
            <div style={{fontSize:8,color:t.sec,textTransform:"uppercase",letterSpacing:0.5,marginBottom:3,lineHeight:1.3}}>Retraits en attente</div>
            <div style={{fontSize:13,fontWeight:700,color:pendingWdTotal>0?t.amber:t.sec,filter:hideBalance?"blur(8px)":"none"}}>
              {walletCurrency==="CDF"?`${Math.round(pendingWdTotal*USD_TO_CDF).toLocaleString()} FC`:`~$${pendingWdTotal.toFixed(2)}`}
            </div>
          </div>
          <div style={{background:t.card2,borderRadius:12,padding:"10px 8px"}}>
            <div style={{fontSize:8,color:t.sec,textTransform:"uppercase",letterSpacing:0.5,marginBottom:3,lineHeight:1.3}}>Cette semaine</div>
            <div style={{fontSize:13,fontWeight:700,color:t.green,filter:hideBalance?"blur(8px)":"none"}}>
              {walletCurrency==="CDF"?`+${Math.round(weekEarnings*USD_TO_CDF).toLocaleString()} FC`:`+$${weekEarnings.toFixed(2)}`}
            </div>
          </div>
          <div style={{background:t.card2,borderRadius:12,padding:"10px 8px"}}>
            <div style={{fontSize:8,color:t.sec,textTransform:"uppercase",letterSpacing:0.5,marginBottom:3,lineHeight:1.3}}>Ce mois-ci</div>
            <div style={{fontSize:13,fontWeight:700,color:t.primary,filter:hideBalance?"blur(8px)":"none"}}>
              {walletCurrency==="CDF"?`+${Math.round(monthEarnings*USD_TO_CDF).toLocaleString()} FC`:`+$${monthEarnings.toFixed(2)}`}
            </div>
          </div>
        </div>
      </div>

      {}
      {showFeesPay&&<FeesPaymentScreen unpaidAmount={unpaidFees} uid="usr_customer" onClose={()=>setShowFeesPay(false)} onSubmitted={()=>{setShowFeesPay(false);if(onFeeSubmitted)onFeeSubmitted();}}/>}
      {feeStatus==="clear"&&(
        <div style={{background:t.gL,border:`0.5px solid ${t.gM}`,borderRadius:16,padding:"13px 16px",marginBottom:16,display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:34,height:34,borderRadius:10,background:t.gL,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Ico n="check" size={17} color={t.green}/></div>
          <div style={{flex:1}}>
            <div style={{fontSize:12,fontWeight:700,color:t.green}}>Compte actif — génération de liens autorisée</div>
            <div style={{fontSize:11,color:t.green,opacity:0.8,marginTop:1}}>Aucun frais impayé · Tous les liens sont actifs</div>
          </div>
          <div style={{fontSize:14,fontWeight:800,color:t.green}}>$0.00</div></div>
      )}
      {feeStatus==="submitted"&&(
        <div style={{background:t.card2,border:`0.5px solid ${t.line2}`,borderRadius:16,padding:"13px 16px",marginBottom:16,display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:34,height:34,borderRadius:10,background:t.card2,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Ico n="clock" size={17} color={t.sec}/></div>
          <div style={{flex:1}}>
            <div style={{fontSize:12,fontWeight:700,color:t.primary}}>Paiement soumis — vérification en cours</div>
            <div style={{fontSize:11,color:t.sec,opacity:0.85,marginTop:1}}>L'équipe SWIIN vérifie votre transaction sous 24h</div>
          </div></div>
      )}
      {feeStatus==="unpaid"&&(
        <div style={{background:t.aL,border:`0.5px solid ${t.amber}50`,borderRadius:16,padding:"13px 16px",marginBottom:16}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
            <div style={{width:34,height:34,borderRadius:10,background:"rgba(245,158,11,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Ico n="alert" size={17} color={t.amber}/></div>
            <div style={{flex:1}}>
              <div style={{fontSize:12,fontWeight:700,color:t.amber}}>Frais SWIIN à régler</div>
              <div style={{fontSize:11,color:t.amber,opacity:0.8,marginTop:1}}>${unpaidFees.toFixed(2)} impayés · génération de liens verrouillée</div>
            </div>
            <div style={{fontSize:15,fontWeight:800,color:t.amber,flexShrink:0}}>${unpaidFees.toFixed(2)}</div></div>
          <button onClick={()=>setShowFeesPay(true)}
            style={{width:"100%",padding:"11px",borderRadius:12,border:"none",background:t.amber,color:"#000",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:F,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            <Ico n="cash" size={14} color="#000"/>
            Régler mes frais SWIIN — ${unpaidFees.toFixed(2)}</button></div>
      )}

      {}
      <Lbl style={{marginBottom:10}}>Commissions récentes</Lbl>
      {COMMISSIONS_DATA.slice(0,3).map(co=>(
        <div key={co.id} style={{background:t.card,border:`0.5px solid ${t.line}`,borderRadius:14,padding:"12px 14px",marginBottom:8,boxShadow:t.shadow}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:34,height:34,borderRadius:"50%",background:t.card2,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <span style={{fontSize:10,fontWeight:700,color:t.sec}}>{co.buyerInitials}</span></div>
              <div>
                <div style={{fontSize:12,fontWeight:600,color:t.primary}}>{co.buyerName}</div>
                <div style={{fontSize:10,color:t.sec,marginTop:1}}>{co.product} · {co.merchant}</div></div></div>
            <div style={{textAlign:"right",flexShrink:0}}>
              <div style={{fontSize:13,fontWeight:700,color:t.primary}}>
                +{co.currency==="CDF"?`${co.net.toLocaleString()} CDF`:`$${co.net.toFixed(2)}`}</div>
              <Chip label={STATUS_COMM_LABEL[co.status]||co.status} color={STATUS_COMM_COLOR[co.status]||"green"}/>
            </div></div></div>
      ))}

      {}
      <div onClick={onExplore}
        style={{background:t.card,border:`0.5px solid ${t.line}`,borderRadius:16,padding:"14px 16px",marginTop:10,cursor:"pointer",display:"flex",alignItems:"center",gap:12,boxShadow:t.shadow}}>
        <div style={{width:44,height:44,borderRadius:12,background:t.card2,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <Ico n="search" size={20} color={t.sec}/></div>
        <div style={{flex:1}}>
          <div style={{fontSize:14,fontWeight:600,color:t.primary}}>Explorer les commerces</div>
          <div style={{fontSize:11,color:t.sec,marginTop:2}}>Boutiques, Restos, Salons, Cafés, Spas…</div></div>
        <Ico n="arR" size={16} color={t.tert}/></div></div>);
}

function MerchantBalanceDetail({ balance, onBack }) {
  const {dark}=useTheme(); const t=Tk(dark);
  const comms = COMMISSIONS_DATA.filter(co=>co.merchant===balance.merchant&&co.currency===balance.currency);
  const fmtAmt=(v)=>balance.currency==="CDF"?`${Math.round(v).toLocaleString()} CDF`:`$${v.toFixed(2)}`;
  const salesCount = comms.filter(co=>co.status==="available"||co.status==="withdrawn").length;

  const SOURCE_ICON = { whatsapp:"💬", instagram:"📸", tiktok:"🎵", facebook:"📘", direct:"🔗" };

  return (
    <div style={{minHeight:"100%",background:t.bg}}>
      {}
      <div style={{background:t.card,borderBottom:`0.5px solid ${t.line}`,padding:"16px 18px 18px",boxShadow:t.shadow}}>
        <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:6,marginBottom:14,padding:0}}>
          <Ico n="arL" size={16} color={t.sec}/>
          <span style={{fontSize:12,color:t.sec}}>Retour</span></button>
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:18}}>
          <div style={{width:52,height:52,borderRadius:16,background:t.card2,border:`0.5px solid ${t.line2}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <Ico n="store" size={24} color={t.sec}/></div>
          <div>
            <H size={18}>{balance.merchant}</H>
            <div style={{fontSize:11,color:t.sec,marginTop:2}}>Balance en {balance.currency}</div></div></div>
        {}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          {[
            ["Disponible",   fmtAmt(balance.available), t.primary],
            ["Total généré", fmtAmt(balance.total),     t.sec],
            ["Déjà retiré",  fmtAmt(balance.withdrawn), t.tert],
          ].map(([l,v,col])=>(
            <div key={l} style={{background:t.card2,borderRadius:12,padding:"10px 8px",textAlign:"center"}}>
              <div style={{fontSize:8,color:t.sec,textTransform:"uppercase",letterSpacing:0.5,lineHeight:1.4}}>{l}</div>
              <div style={{fontSize:13,fontWeight:700,color:col,marginTop:3}}>{v}</div></div>
          ))}</div></div>

      <div style={{padding:"18px 16px 100px"}}>
        {}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:18}}>
          <Card><Lbl style={{marginBottom:4}}>Ventes générées</Lbl><div style={{fontSize:22,fontWeight:700,color:t.primary,marginTop:3}}>{salesCount}</div></Card>
          <Card><Lbl style={{marginBottom:4}}>Taux commission moy.</Lbl><div style={{fontSize:22,fontWeight:700,color:t.primary,marginTop:3}}>{comms.length>0?(comms.reduce((s,co)=>s+co.commissionRate,0)/comms.length).toFixed(0):0}%</div></Card>
        </div>

        {}
        <Lbl style={{marginBottom:12}}>Historique des ventes via vos liens</Lbl>
        {comms.length===0&&(
          <div style={{textAlign:"center",padding:"30px 0",color:t.tert,fontSize:12}}>Aucune vente enregistrée pour ce marchand.</div>
        )}
        {comms.map((co,i)=>(
          <div key={co.id} style={{background:t.card,border:`0.5px solid ${co.status==="available"?t.gM:t.line}`,borderRadius:16,padding:"14px 16px",marginBottom:10,boxShadow:t.shadow}}>
            {}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:14,fontWeight:700,color:t.primary}}>{co.product}</div>
                <div style={{fontSize:11,color:t.sec,marginTop:2}}>{co.buyerName} · {co.date}</div></div>
              <div style={{textAlign:"right",flexShrink:0,marginLeft:10}}>
                <div style={{fontSize:16,fontWeight:800,color:t.primary}}>
                  +{co.currency==="CDF"?`${co.net.toLocaleString()} CDF`:`$${co.net.toFixed(2)}`}</div>
                <Chip label={STATUS_COMM_LABEL[co.status]||co.status} color={STATUS_COMM_COLOR[co.status]||"green"}/>
              </div></div>

            {}
            <div style={{background:t.card2,borderRadius:12,padding:"10px 12px",marginBottom:8}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
                {[
                  ["Prix payé",        co.currency==="CDF"?`${co.orderAmount.toLocaleString()} CDF`:`$${co.orderAmount}`],
                  [`Commission (${co.commissionRate}%)`, co.currency==="CDF"?`${co.commGross.toLocaleString()} CDF`:`$${co.commGross.toFixed(2)}`],
                  ["Frais SWIIN",      co.currency==="CDF"?`-${co.fee.toLocaleString()} CDF`:`-$${co.fee.toFixed(2)}`],
                ].map(([l,v])=>(
                  <div key={l}>
                    <div style={{fontSize:8,color:t.tert,lineHeight:1.3}}>{l}</div>
                    <div style={{fontSize:11,fontWeight:600,color:t.primary,marginTop:2}}>{v}</div></div>
                ))}</div></div>

            {}
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:co.source==="whatsapp"?"#25D366":co.source==="instagram"?"#E4405F":co.source==="tiktok"?"#888":co.source==="facebook"?"#1877F2":t.sec,flexShrink:0}}/>
              <span style={{fontSize:11,color:t.sec,textTransform:"capitalize"}}>{co.source}</span>
              <span style={{fontSize:10,color:t.tert}}>· {co.time}</span></div></div>
        ))}</div></div>);
}

function CustomerWallet({ withdrawals, onGoWithdraw, walletCurrency='USD', setWalletCurrency, hideBalance=false, setHideBalance }) {
  const {dark}=useTheme(); const t=Tk(dark);
  const {profile}=useAuth();
  const [detailBalance, setDetailBalance] = useState(null);
  const [showFeesPay, setShowFeesPay] = useState(false);

  const balances = computeBalances(COMMISSIONS_DATA, withdrawals);
  const toUSD = (v,cur)=>cur==="CDF"?v/USD_TO_CDF:v;
  const totalAvailableUSD = balances.reduce((s,b)=>s+toUSD(b.available,b.currency),0);
  const totalPendingUSD   = balances.reduce((s,b)=>s+toUSD(b.pending,b.currency),0);
  const unpaidFees = COMMISSIONS_DATA.filter(co=>co.status==="locked").reduce((s,co)=>s+co.fee,0);
  // Display helper respecting walletCurrency
  const dispUSD=(v)=>walletCurrency==="CDF"?`${Math.round(v*USD_TO_CDF).toLocaleString()} FC`:`$${v.toFixed(2)}`;

  const fmtAmt=(v,cur)=>cur==="CDF"?`${Math.round(v).toLocaleString()} CDF`:`$${v.toFixed(2)}`;
  if(detailBalance) return <MerchantBalanceDetail balance={detailBalance} onBack={()=>setDetailBalance(null)}/>;

  return (
    <div style={{padding:"20px 16px 100px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div><Lbl style={{marginBottom:4}}>MON WALLET</Lbl><H size={22}>Finances</H></div>
        <ThemeToggle/></div>

      {}
      <div style={{background:t.card,border:`0.5px solid ${t.line}`,borderRadius:22,padding:22,marginBottom:14,boxShadow:t.shadow,position:"relative",overflow:"hidden"}}>
        {dark&&<div style={{position:"absolute",top:-40,right:-40,width:120,height:120,borderRadius:"50%",background:`radial-gradient(circle,${t.gL},transparent 70%)`,pointerEvents:"none"}}/>}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <Lbl>Solde disponible au retrait</Lbl>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {setWalletCurrency&&(
              <div style={{display:"flex",background:t.card2,borderRadius:8,padding:2,gap:2}}>
                {["USD","CDF"].map(cur=>(
                  <button key={cur} onClick={()=>setWalletCurrency(cur)} style={{padding:"3px 8px",borderRadius:6,border:"none",background:walletCurrency===cur?t.primary:"transparent",color:walletCurrency===cur?t.inv:t.sec,fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:F}}>{cur}</button>
                ))}
              </div>
            )}
            {setHideBalance&&(
              <button onClick={()=>setHideBalance(h=>!h)} style={{background:"none",border:"none",cursor:"pointer",padding:2}}>
                <Ico n={hideBalance?"eye":"eyeOff"} size={15} color={t.sec}/>
              </button>
            )}
          </div>
        </div>
        <div style={{fontSize:42,fontWeight:800,letterSpacing:-2,color:t.primary,marginBottom:4,filter:hideBalance?"blur(12px)":"none",transition:"filter 0.2s"}}>
          {dispUSD(totalAvailableUSD)}
        </div>
        <div style={{fontSize:11,color:t.sec,marginBottom:18}}>Toutes devises confondues</div>
        <div style={{display:"flex",gap:8}}>
          <div style={{flex:1,background:t.card2,borderRadius:12,padding:"10px 10px"}}>
            <div style={{fontSize:9,color:t.sec,textTransform:"uppercase",letterSpacing:0.5}}>En attente validation</div>
            <div style={{fontSize:13,fontWeight:700,color:t.amber,marginTop:3}}>~${totalPendingUSD.toFixed(2)}</div>
          </div>
          <div
            onClick={unpaidFees>0?()=>setShowFeesPay(true):undefined}
            style={{flex:1,background:unpaidFees>0?t.rL:t.card2,borderRadius:12,padding:"10px 10px",border:`0.5px solid ${unpaidFees>0?t.red+"30":"transparent"}`,cursor:unpaidFees>0?"pointer":"default"}}>
            <div style={{fontSize:9,color:unpaidFees>0?t.red:t.sec,textTransform:"uppercase",letterSpacing:0.5}}>Frais SWIIN</div>
            <div style={{fontSize:13,fontWeight:700,color:unpaidFees>0?t.red:t.sec,marginTop:3}}>${unpaidFees.toFixed(2)}</div>
            {unpaidFees>0&&<div style={{fontSize:8,color:t.red,marginTop:2,opacity:0.8}}>Appuyez pour régler →</div>}
          </div></div></div>
      {showFeesPay&&<FeesPaymentScreen unpaidAmount={unpaidFees} uid={profile?.uid||"usr_customer"} onClose={()=>setShowFeesPay(false)} onSubmitted={()=>setShowFeesPay(false)}/>}

      {}
      <button onClick={onGoWithdraw}
        style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",background:t.green,border:"none",borderRadius:16,padding:"14px 18px",cursor:"pointer",fontFamily:F,marginBottom:20}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <Ico n="cash" size={18} color="#000"/>
          <div style={{textAlign:"left"}}>
            <div style={{fontSize:14,fontWeight:700,color:"#000"}}>Retirer mes gains</div>
            <div style={{fontSize:10,color:"rgba(0,0,0,0.6)"}}>Sélectionner un marchand</div></div></div>
        <Ico n="arR" size={18} color="#000"/></button>

      {}
      <Lbl style={{marginBottom:10}}>Balance par marchand <span style={{color:t.tert,fontWeight:400,letterSpacing:0}}>— cliquez pour le détail</span></Lbl>
      {balances.length===0&&(
        <div style={{textAlign:"center",padding:"30px 0",color:t.tert,fontSize:12}}>
          Partagez vos liens pour générer des commissions.</div>
      )}
      {balances.map(b=>(
        <div key={b.merchant+b.currency}
          onClick={()=>setDetailBalance(b)}
          style={{background:t.card,border:`0.5px solid ${t.line}`,borderRadius:16,padding:"14px 16px",marginBottom:8,cursor:"pointer",boxShadow:t.shadow,transition:"border-color 0.2s"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:700,color:t.primary}}>{b.merchant}</div>
              <div style={{fontSize:10,color:t.sec,marginTop:1}}>Devise : {b.currency}</div></div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:17,fontWeight:800,color:t.primary}}>{fmtAmt(b.available,b.currency)}</div>
              <div style={{fontSize:10,color:t.sec}}>disponible</div></div>
            <Ico n="arR" size={15} color={t.tert} style={{marginLeft:8,marginTop:2}}/></div>
          <div style={{display:"flex",gap:10,marginBottom:6}}>
            {b.pending>0&&<div style={{background:t.aL,borderRadius:8,padding:"4px 8px"}}><div style={{fontSize:9,color:t.amber}}>En attente</div><div style={{fontSize:11,fontWeight:600,color:t.amber}}>{fmtAmt(b.pending,b.currency)}</div></div>}
            {b.withdrawn>0&&<div style={{background:t.card2,borderRadius:8,padding:"4px 8px"}}><div style={{fontSize:9,color:t.sec}}>Retiré</div><div style={{fontSize:11,fontWeight:600,color:t.sec}}>{fmtAmt(b.withdrawn,b.currency)}</div></div>}
            <div style={{flex:1,display:"flex",alignItems:"center"}}>
              <div style={{width:"100%",height:3,background:t.line,borderRadius:2}}>
                <div style={{height:"100%",width:`${(b.available+b.withdrawn)>0?Math.min(100,(b.available/(b.available+b.withdrawn))*100):0}%`,background:t.green,borderRadius:2}}/>
              </div></div></div></div>
      ))}

      {}
      <Lbl style={{margin:"18px 0 10px"}}>Gains nets — 7 jours</Lbl>
      <div style={{background:t.card,border:`0.5px solid ${t.line}`,borderRadius:16,padding:"16px 16px 12px",marginBottom:18,boxShadow:t.shadow}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <Lbl>Évolution hebdomadaire</Lbl>
          <Chip label="+32%" color="green"/></div>
        <MiniBar data={[8,22,14,38,28,52,41]}/>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:8}}>
          {["L","M","M","J","V","S","D"].map(d=><div key={d} style={{flex:1,textAlign:"center",fontSize:9,color:t.tert}}>{d}</div>)}
        </div></div>

      {}
      <Lbl style={{margin:"4px 0 10px"}}>Toutes les commissions</Lbl>
      {COMMISSIONS_DATA.map((co,i)=>(
        <div key={co.id}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 0"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:34,height:34,borderRadius:"50%",background:t.card2,border:`0.5px solid ${t.line2}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <span style={{fontSize:10,fontWeight:700,color:t.sec}}>{co.buyerInitials}</span></div>
              <div>
                <div style={{fontSize:12,fontWeight:600,color:t.primary}}>{co.buyerName} · {co.product}</div>
                <div style={{fontSize:10,color:t.sec,marginTop:1}}>{co.merchant} · {co.date}</div></div></div>
            <div style={{textAlign:"right",flexShrink:0}}>
              <div style={{fontSize:13,fontWeight:700,color:t.primary}}>
                +{co.currency==="CDF"?`${co.net.toLocaleString()} CDF`:`$${co.net.toFixed(2)}`}</div>
              <Chip label={STATUS_COMM_LABEL[co.status]||co.status} color={STATUS_COMM_COLOR[co.status]||"green"}/>
            </div></div>
          {i<COMMISSIONS_DATA.length-1&&<Div m="0"/>}</div>
      ))}</div>);
}

function CustomerWithdraw({ withdrawals, setWithdrawals }) {
  const {dark}=useTheme(); const t=Tk(dark);
  const [view,setView]=useState("list");
  const [form,setForm]=useState({ merchant:"", currency:"USD", amount:"", method:"", provider:"", number:"" });
  const [codeInputs,setCodeInputs]=useState({});
  const [codeErrors,setCodeErrors]=useState({});
  const [successWd,setSuccessWd]=useState(null);
  const [search,setSearch]=useState("");
  const [showAll,setShowAll]=useState(false);

  const balances = computeBalances(COMMISSIONS_DATA, withdrawals);
  const toUSD = (v,cur)=>cur==="CDF"?v/USD_TO_CDF:v;
  const fmtAmt = (v,cur)=>cur==="CDF"?`${Math.round(v).toLocaleString()} CDF`:`$${parseFloat(v).toFixed(2)}`;

  const liveAll    = SharedDB.getWithdrawals().filter(w=>w.customerId==="usr_customer");
  const approved   = liveAll.filter(w=>w.status==="approved");
  const pendingWds = liveAll.filter(w=>w.status==="pending");
  const rejected   = liveAll.filter(w=>w.status==="rejected");
  const completed  = liveAll.filter(w=>w.status==="completed");
  const pending    = liveAll.filter(w=>w.status==="pending"||w.status==="approved");
  const history    = liveAll.filter(w=>w.status==="completed"||w.status==="rejected");

  const selectedBal = balances.find(b=>b.merchant===form.merchant&&b.currency===form.currency);
  const available = selectedBal?.available||0;
  const reqAmt = parseFloat(form.amount)||0;
  const amountOk = reqAmt>0 && reqAmt<=available;
  const syncWd = () => setWithdrawals([...SharedDB.getWithdrawals().filter(w=>w.customerId==="usr_customer")]);
  const handleConfirm = (wd) => {
    const input = (codeInputs[wd.id]||"").toUpperCase().trim();
    if(SharedDB.validateCode(wd.id, input)) {
      SharedDB.completeWithdrawal(wd.id);
      syncWd();
      setSuccessWd(wd);
      setView("success");
      setCodeInputs(p=>({...p,[wd.id]:""}));
      setCodeErrors(p=>({...p,[wd.id]:false}));
    } else {
      setCodeErrors(p=>({...p,[wd.id]:true}));
    }
  };
  if(view==="success"&&successWd) {
    const fmtS=(v,cur)=>cur==="CDF"?`${Math.round(v).toLocaleString()} FC`:`$${parseFloat(v).toFixed(2)}`;
    const balancesAfter = computeBalances(COMMISSIONS_DATA, withdrawals);
    const balAfter = balancesAfter.find(b=>b.merchant===successWd.merchant&&b.currency===successWd.currency);
    return (
      <div style={{padding:"40px 24px",display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center",gap:0,minHeight:"100%",background:t.bg}}>
        {}
        <div style={{width:88,height:88,borderRadius:"50%",background:t.gL,border:`2.5px solid ${t.green}`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:24}}>
          <Ico n="check" size={40} color={t.green} sw={2.5}/></div>

        <H size={26} style={{marginBottom:10}}>Retrait effectué</H>
        <H size={26} style={{marginBottom:20,color:t.green}}>avec succès !</H>

        <div style={{fontSize:13,color:t.sec,marginBottom:28,lineHeight:1.7}}>
          Votre retrait chez <strong style={{color:t.primary}}>{successWd.merchant}</strong> a été validé.<br/>
          La balance a été mise à jour.</div>

        {}
        <div style={{background:t.card,border:`0.5px solid ${t.gM}`,borderRadius:20,padding:22,width:"100%",marginBottom:20,boxShadow:t.shadow}}>
          <Lbl style={{marginBottom:14,textAlign:"center"}}>Récapitulatif du retrait</Lbl>
          {[
            ["Marchand",  successWd.merchant],
            ["Montant retiré", fmtS(successWd.amount,successWd.currency)],
            ["Méthode",   successWd.method==="cash"?"Espèces":"Mobile Money"+(successWd.provider?` · ${successWd.provider}`:"")],
            ["Code utilisé", successWd.code],
            ["Statut",    "Complété"],
          ].map(([l,v])=>(
            <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:`0.5px solid ${t.line}`}}>
              <span style={{fontSize:12,color:t.sec}}>{l}</span>
              <span style={{fontSize:13,fontWeight:600,color:l==="Code utilisé"?t.tert:l==="Statut"?t.green:t.primary,fontFamily:l==="Code utilisé"?"monospace":F}}>{v}</span>
            </div>
          ))}
          {}
          <div style={{marginTop:14,background:t.card2,borderRadius:14,padding:"14px 16px",textAlign:"center"}}>
            <Lbl style={{marginBottom:6,textAlign:"center"}}>Nouveau solde disponible</Lbl>
            <div style={{fontSize:32,fontWeight:800,color:t.primary,letterSpacing:-1}}>
              {balAfter ? fmtS(Math.max(0,balAfter.available), successWd.currency) : fmtS(0, successWd.currency)}
            </div>
            <div style={{fontSize:11,color:t.sec,marginTop:4}}>chez {successWd.merchant}</div></div></div>

        {}
        <div style={{background:t.card2,border:`0.5px solid ${t.line2}`,borderRadius:12,padding:"10px 14px",width:"100%",marginBottom:24,display:"flex",alignItems:"center",gap:8}}>
          <Ico n="shield" size={14} color={t.sec}/>
          <span style={{fontSize:11,color:t.sec}}>Le code <strong style={{fontFamily:"monospace"}}>{successWd.code}</strong> a été désactivé et ne peut plus être utilisé.</span>
        </div>

        <button onClick={()=>{setView("list");setSuccessWd(null);}}
          style={{width:"100%",padding:"15px",borderRadius:14,border:"none",background:t.primary,color:t.inv,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:F}}>
          Retour aux retraits</button></div>);
  }
  if(view==="form") return (
    <div style={{padding:"24px 18px 100px"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}>
        <button onClick={()=>{setView("list");setForm({merchant:"",currency:"USD",amount:"",method:"",provider:"",number:""},);}} style={{background:"none",border:"none",cursor:"pointer"}}><Ico n="arL" size={20} color={t.primary}/></button>
        <div>
          <Lbl style={{marginBottom:3}}>NOUVEAU RETRAIT</Lbl>
          <H size={20}>{form.merchant?"Retrait — "+form.merchant:"Demande de retrait"}</H></div></div>

      {}
      <Lbl style={{marginBottom:8}}>1. Sélectionner le marchand</Lbl>
      {balances.filter(b=>b.available>0).length===0&&(
        <div style={{background:t.card2,borderRadius:12,padding:"14px",textAlign:"center",marginBottom:14,fontSize:12,color:t.sec}}>
          Aucune balance disponible pour le moment.</div>
      )}
      {balances.filter(b=>b.available>0).map(b=>(
        <div key={b.merchant+b.currency} onClick={()=>setForm(f=>({...f,merchant:b.merchant,currency:b.currency,amount:""}))}
          style={{padding:"12px 14px",borderRadius:14,cursor:"pointer",border:`0.5px solid ${form.merchant===b.merchant&&form.currency===b.currency?t.primary:t.line}`,background:form.merchant===b.merchant&&form.currency===b.currency?t.card2:"transparent",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6,transition:"all 0.15s"}}>
          <div>
            <div style={{fontSize:13,fontWeight:600,color:t.primary}}>{b.merchant}</div>
            <div style={{fontSize:10,color:t.sec,marginTop:1}}>Disponible : {fmtAmt(b.available,b.currency)}</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:10,background:t.card,border:`0.5px solid ${t.line2}`,padding:"2px 7px",borderRadius:6,color:t.sec,fontFamily:"monospace"}}>{b.currency}</span>
            {form.merchant===b.merchant&&form.currency===b.currency&&<Ico n="check" size={15} color={t.green}/>}</div>
        </div>
      ))}

      {}
      {form.merchant&&(
        <>
          <Lbl style={{margin:"16px 0 8px"}}>2. Montant à retirer</Lbl>
          <div style={{position:"relative",marginBottom:6}}>
            <input type="number" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))}
              placeholder="0"
              style={{width:"100%",background:t.card2,border:`0.5px solid ${form.amount&&!amountOk?t.red+"60":t.line2}`,borderRadius:14,padding:"16px 60px 16px 16px",color:t.primary,fontSize:28,fontWeight:800,fontFamily:F,outline:"none",textAlign:"center",boxSizing:"border-box"}}/>
            <div style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",fontSize:12,fontWeight:700,color:t.sec}}>{form.currency}</div>
          </div>
          {form.amount&&!amountOk&&(
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
              <Ico n="alert" size={13} color={t.red}/>
              <span style={{fontSize:11,color:t.red}}>Balance insuffisante. Max : {fmtAmt(available,form.currency)}</span>
            </div>
          )}
          {form.amount&&amountOk&&<div style={{fontSize:11,color:t.green,marginBottom:8,textAlign:"center"}}>✓ Montant valide</div>}
          <div style={{fontSize:10,color:t.tert,textAlign:"center",marginBottom:14}}>Maximum disponible : {fmtAmt(available,form.currency)}</div>
        </>
      )}

      {}
      {form.merchant&&amountOk&&(
        <>
          <Lbl style={{margin:"4px 0 10px"}}>3. Mode de paiement</Lbl>
          <div style={{display:"flex",gap:8,marginBottom:14}}>
            {[{id:"cash",label:"Espèces",icon:"wallet"},{id:"mobile_money",label:"Mobile Money",icon:"phone"}].map(m=>(
              <div key={m.id} onClick={()=>setForm(f=>({...f,method:m.id,provider:"",number:""}))}
                style={{flex:1,padding:"12px 8px",borderRadius:14,cursor:"pointer",border:`0.5px solid ${form.method===m.id?t.primary:t.line}`,background:form.method===m.id?t.card2:"transparent",textAlign:"center",transition:"all 0.15s"}}>
                <div style={{display:"flex",justifyContent:"center",marginBottom:6}}><Ico n={m.icon} size={20} color={form.method===m.id?t.primary:t.sec}/></div>
                <div style={{fontSize:11,fontWeight:600,color:form.method===m.id?t.primary:t.sec}}>{m.label}</div>
              </div>
            ))}</div>
        </>
      )}

      {}
      {form.method==="mobile_money"&&(
        <>
          <Lbl style={{marginBottom:8}}>Opérateur</Lbl>
          <div style={{display:"flex",gap:6,marginBottom:12}}>
            {[["orange","Orange"],["airtel","Airtel"],["mpesa","M-Pesa"]].map(([id,label])=>(
              <button key={id} onClick={()=>setForm(f=>({...f,provider:id}))}
                style={{flex:1,padding:"9px 0",borderRadius:10,border:`0.5px solid ${form.provider===id?t.primary:t.line}`,background:form.provider===id?t.primary:"transparent",color:form.provider===id?t.inv:t.sec,fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:F}}>
                {label}</button>
            ))}</div>
          <Lbl style={{marginBottom:6}}>Numéro</Lbl>
          <div style={{display:"flex",alignItems:"center",gap:10,background:t.card2,border:`0.5px solid ${t.line2}`,borderRadius:14,padding:"13px 14px",marginBottom:14}}>
            <Ico n="phone" size={16} color={t.sec}/>
            <input value={form.number} onChange={e=>setForm(f=>({...f,number:e.target.value}))}
              placeholder="+243 800 000 000"
              style={{flex:1,background:"transparent",border:"none",outline:"none",color:t.primary,fontSize:14,fontFamily:F}}/>
          </div>
        </>
      )}

      {form.merchant&&(
        <button
          disabled={!amountOk||!form.method||(form.method==="mobile_money"&&(!form.provider||!form.number))}
          onClick={()=>{
            const newWd={id:"WD-"+Date.now(),customerId:"usr_customer",customerName:"Dieumerci K.",merchant:form.merchant,amount:reqAmt,currency:form.currency,date:"Maintenant",method:form.method,provider:form.provider||null,number:form.number||null,status:"pending",code:null,codeUsed:false};
            SharedDB.addWithdrawal(newWd);
            syncWd();
            setForm({merchant:"",currency:"USD",amount:"",method:"",provider:"",number:""});
            setView("list");
          }}
          style={{width:"100%",padding:"15px",borderRadius:14,border:"none",background:amountOk&&form.method?t.primary:t.card2,color:amountOk&&form.method?t.inv:t.sec,fontSize:14,fontWeight:700,cursor:amountOk&&form.method?"pointer":"not-allowed",fontFamily:F,transition:"all 0.2s"}}>
          Demander le retrait</button>
      )}
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,marginTop:10}}>
        <Ico n="shield" size={12} color={t.tert}/>
        <span style={{fontSize:10,color:t.tert}}>Sécurisé · Anti-fraude SWIIN</span></div></div>);
  if(view==="history") return (
    <div style={{padding:"24px 16px 100px"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
        <button onClick={()=>setView("list")} style={{background:"none",border:"none",cursor:"pointer"}}><Ico n="arL" size={20} color={t.primary}/></button>
        <div><Lbl style={{marginBottom:3}}>HISTORIQUE</Lbl><H size={20}>Retraits effectués</H></div></div>
      {history.length===0&&(
        <div style={{textAlign:"center",padding:"40px 0",color:t.tert,fontSize:12}}>Aucun retrait complété pour l'instant.</div>
      )}
      {history.map(wd=>(
        <div key={wd.id} style={{background:t.card,border:`0.5px solid ${wd.status==="completed"?t.gM:t.line}`,borderRadius:16,padding:"14px 16px",marginBottom:10,boxShadow:t.shadow}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
            <div>
              <div style={{fontSize:14,fontWeight:700,color:t.primary}}>{wd.merchant}</div>
              <div style={{fontSize:11,color:t.sec,marginTop:2}}>{wd.method==="cash"?"Espèces":"Mobile Money"}{wd.provider?` · ${wd.provider}`:""}</div>
              <div style={{fontSize:10,color:t.tert,marginTop:1}}>{wd.date} · #{wd.id.replace("WD-","")}</div></div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:16,fontWeight:800,color:wd.status==="completed"?t.green:t.red}}>
                {wd.currency==="CDF"?`${Math.round(wd.amount).toLocaleString()} CDF`:`$${wd.amount.toFixed(2)}`}</div>
              <Chip label={wd.status==="completed"?"Complété":"Rejeté"} color={wd.status==="completed"?"green":"red"}/>
            </div></div>
          {wd.status==="completed"&&wd.code&&(
            <div style={{background:t.card2,borderRadius:10,padding:"7px 10px",display:"flex",alignItems:"center",gap:8}}>
              <Ico n="check" size={12} color={t.green}/>
              <span style={{fontSize:10,color:t.sec}}>Code utilisé : </span>
              <span style={{fontSize:10,fontFamily:"monospace",fontWeight:700,color:t.tert}}>{wd.code}</span>
              <span style={{fontSize:9,color:t.tert,marginLeft:"auto"}}>Code non réutilisable</span></div>
          )}</div>
      ))}</div>);
  const totalAvailUSD = balances.reduce((s,b)=>s+(b.currency==="CDF"?b.available/USD_TO_CDF:b.available),0);
  const filteredMerchants = balances.filter(b=>!search||(b.merchant.toLowerCase().includes(search.toLowerCase())));
  const visibleBalances = showAll ? filteredMerchants : filteredMerchants.slice(0,4);

  return (
    <div style={{padding:"20px 16px 100px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div><Lbl style={{marginBottom:4}}>RETRAITS</Lbl><H size={22}>Mes retraits</H></div>
        <ThemeToggle/></div>

      {}
      <div style={{background:t.card,border:`0.5px solid ${t.line}`,borderRadius:20,padding:20,marginBottom:14,boxShadow:t.shadow}}>
        <Lbl style={{marginBottom:6}}>Total disponible au retrait</Lbl>
        <div style={{fontSize:36,fontWeight:800,letterSpacing:-2,color:t.primary,marginBottom:14}}>
          ~${totalAvailUSD.toFixed(2)}</div>

        {}
        <div style={{display:"flex",alignItems:"center",gap:8,background:t.card2,border:`0.5px solid ${t.line2}`,borderRadius:12,padding:"9px 12px",marginBottom:12}}>
          <Ico n="search" size={14} color={t.sec}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Chercher un marchand..."
            style={{flex:1,background:"transparent",border:"none",outline:"none",color:t.primary,fontSize:12,fontFamily:F}}/>
          {search&&<button onClick={()=>setSearch("")} style={{background:"none",border:"none",color:t.sec,cursor:"pointer",fontSize:14,lineHeight:1}}>×</button>}
        </div>

        {}
        <Lbl style={{marginBottom:8}}>Balances par marchand — appuyez pour retirer</Lbl>
        {visibleBalances.map(b=>(
          <div key={b.merchant+b.currency}
            onClick={()=>{
              setForm({merchant:b.merchant,currency:b.currency,amount:"",method:"",provider:"",number:""});
              setView("form");
            }}
            style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 0",borderBottom:`0.5px solid ${t.line}`,cursor:"pointer"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:34,height:34,borderRadius:10,background:t.card2,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <Ico n="store" size={15} color={t.sec}/></div>
              <div>
                <div style={{fontSize:13,fontWeight:600,color:t.primary}}>{b.merchant}</div>
                <div style={{fontSize:10,color:t.tert,marginTop:1}}>Devise : {b.currency}</div></div></div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:14,fontWeight:700,color:t.primary}}>
                  {b.currency==="CDF"?`${Math.round(b.available).toLocaleString()} CDF`:`$${b.available.toFixed(2)}`}
                </div>
                <div style={{fontSize:9,color:t.sec}}>disponible</div></div>
              <Ico n="arR" size={14} color={t.tert}/></div></div>
        ))}
        {filteredMerchants.length>4&&(
          <button onClick={()=>setShowAll(s=>!s)} style={{width:"100%",marginTop:10,padding:"9px 0",borderRadius:10,border:`0.5px solid ${t.line2}`,background:"transparent",color:t.sec,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:F}}>
            {showAll?`Réduire ↑`:`Voir plus (${filteredMerchants.length-4} autres) ↓`}</button>
        )}</div>

      {}
      <button onClick={()=>setView("form")}
        style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",background:t.primary,border:"none",borderRadius:16,padding:"14px 18px",cursor:"pointer",fontFamily:F,marginBottom:20}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <Ico n="cash" size={18} color={t.inv}/>
          <span style={{fontSize:14,fontWeight:700,color:t.inv}}>Nouvelle demande de retrait</span></div>
        <Ico n="arR" size={18} color={t.inv}/></button>

      {/* ── Approuvés — code disponible ── */}
      {approved.length>0&&(
        <>
          <Lbl style={{marginBottom:10}}>Retraits approuvés — code disponible</Lbl>
          {approved.map(wd=>(
            <div key={wd.id} style={{background:t.card,border:`0.5px solid ${wd.status==="approved"?t.green:t.amber+"50"}`,borderRadius:16,padding:"15px 16px",marginBottom:10,boxShadow:t.shadow}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                <div>
                  <div style={{fontSize:14,fontWeight:700,color:t.primary}}>{wd.merchant}</div>
                  <div style={{fontSize:11,color:t.sec,marginTop:2}}>{wd.method==="cash"?"Espèces":"Mobile Money"}{wd.provider?` · ${wd.provider}`:""} · {wd.date}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:16,fontWeight:800,color:t.primary}}>
                    {wd.currency==="CDF"?`${Math.round(wd.amount).toLocaleString()} CDF`:`$${wd.amount.toFixed(2)}`}
                  </div>
                  <Chip label={wd.status==="approved"?"Approuvé — code disponible":"En attente du marchand"} color={wd.status==="approved"?"green":"amber"}/>
                </div></div>

              {}
              {wd.status==="approved"&&wd.code&&(
                <>
                  <div style={{background:t.gL,border:`0.5px solid ${t.green}`,borderRadius:12,padding:"14px 16px",marginBottom:12}}>
                    <div style={{fontSize:11,color:t.green,fontWeight:600,marginBottom:8}}>
                      {wd.merchant} a approuvé votre retrait.</div>
                    <div style={{fontSize:11,color:t.green,marginBottom:10}}>Votre code de retrait :</div>
                    <div style={{fontSize:32,fontWeight:800,letterSpacing:6,fontFamily:"monospace",color:t.green,textAlign:"center",background:"rgba(91,255,122,0.08)",padding:"12px",borderRadius:10}}>
                      {wd.code}</div></div>

                  {}
                  <Lbl style={{marginBottom:6}}>Confirmez avec ce code pour valider le retrait</Lbl>
                  <input
                    value={codeInputs[wd.id]||""}
                    onChange={e=>{setCodeInputs(p=>({...p,[wd.id]:e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g,"")}));setCodeErrors(p=>({...p,[wd.id]:false}));}}
                    placeholder="SW-·····"
                    maxLength={8}
                    style={{width:"100%",background:t.card2,border:`0.5px solid ${codeErrors[wd.id]?t.red+"60":t.line2}`,borderRadius:12,padding:"13px 0",color:t.primary,fontSize:22,fontWeight:800,letterSpacing:5,fontFamily:"monospace",textAlign:"center",outline:"none",boxSizing:"border-box",marginBottom:6}}
                  />
                  {codeErrors[wd.id]&&<div style={{fontSize:11,color:t.red,textAlign:"center",marginBottom:6}}>Code incorrect. Vérifiez le message du marchand.</div>}
                  <button
                    disabled={(codeInputs[wd.id]||"").length<6}
                    onClick={()=>handleConfirm(wd)}
                    style={{width:"100%",padding:"12px",borderRadius:12,border:"none",background:(codeInputs[wd.id]||"").length>=6?t.green:t.card2,color:(codeInputs[wd.id]||"").length>=6?"#000":t.sec,fontSize:13,fontWeight:700,cursor:(codeInputs[wd.id]||"").length>=6?"pointer":"not-allowed",fontFamily:F,transition:"all 0.2s"}}>
                    Confirmer le retrait</button>
                </>
              )}

              {wd.status==="pending"&&(
                <div style={{fontSize:11,color:t.sec,textAlign:"center",padding:"10px",background:t.card2,borderRadius:10}}>
                  En attente d'approbation du marchand…</div>
              )}
</div>
          ))}
        </>
      )}

      {/* ── En attente du marchand ── */}
      {pendingWds.length>0&&(
        <>
          <Lbl style={{marginBottom:10}}>En attente du marchand</Lbl>
          {pendingWds.map(wd=>(
            <div key={wd.id} style={{background:t.card,border:`0.5px solid ${t.amber}40`,borderRadius:16,padding:"14px 16px",marginBottom:10,boxShadow:t.shadow}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                <div>
                  <div style={{fontSize:14,fontWeight:700,color:t.primary}}>{wd.merchant}</div>
                  <div style={{fontSize:11,color:t.sec,marginTop:2}}>{wd.method==="cash"?"Espèces":"Mobile Money"}{wd.provider?` · ${wd.provider}`:""} · {wd.date}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:16,fontWeight:800,color:t.primary}}>{wd.currency==="CDF"?`${Math.round(wd.amount).toLocaleString()} CDF`:`$${wd.amount.toFixed(2)}`}</div>
                  <Chip label="En attente" color="amber"/>
                </div>
              </div>
              <div style={{background:t.card2,borderRadius:10,padding:"9px 12px",display:"flex",alignItems:"center",gap:8}}>
                <Ico n="clock" size={14} color={t.sec}/>
                <span style={{fontSize:11,color:t.sec}}>Le marchand n'a pas encore répondu à votre demande.</span>
              </div>
            </div>
          ))}
        </>
      )}

      {/* ── Rejetés ── */}
      {rejected.length>0&&(
        <>
          <Lbl style={{marginBottom:10}}>Demandes rejetées</Lbl>
          {rejected.map(wd=>(
            <div key={wd.id} style={{background:t.card,border:`0.5px solid ${t.red}30`,borderRadius:16,padding:"14px 16px",marginBottom:10,boxShadow:t.shadow}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                <div>
                  <div style={{fontSize:14,fontWeight:700,color:t.primary}}>{wd.merchant}</div>
                  <div style={{fontSize:11,color:t.sec,marginTop:2}}>{wd.method==="cash"?"Espèces":"Mobile Money"}{wd.provider?` · ${wd.provider}`:""} · {wd.date}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:16,fontWeight:800,color:t.red}}>{wd.currency==="CDF"?`${Math.round(wd.amount).toLocaleString()} CDF`:`$${wd.amount.toFixed(2)}`}</div>
                  <Chip label="Rejeté" color="red"/>
                </div>
              </div>
              <div style={{background:t.rL,border:`0.5px solid ${t.red}30`,borderRadius:10,padding:"9px 12px"}}>
                <div style={{fontSize:11,color:t.red,fontWeight:600,marginBottom:2}}>Demande refusée par le marchand</div>
                {wd.rejectedReason&&<div style={{fontSize:10,color:t.red,opacity:0.8,marginTop:2}}>{wd.rejectedReason}</div>}
              </div>
            </div>
          ))}
        </>
      )}

      {history.length>0&&(
        <button onClick={()=>setView("history")}
          style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",background:"transparent",border:`0.5px solid ${t.line2}`,borderRadius:14,padding:"13px 16px",cursor:"pointer",fontFamily:F,marginTop:4}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <Ico n="clock" size={16} color={t.sec}/>
            <span style={{fontSize:13,fontWeight:600,color:t.primary}}>Historique des retraits</span></div>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:11,color:t.sec}}>{history.length} retrait{history.length>1?"s":""}</span>
            <Ico n="arR" size={15} color={t.tert}/></div></button>
      )}</div>);
}

function LinkDetailView({ link, onBack }) {
  const {dark}=useTheme(); const t=Tk(dark);
  const [copied,setCopied]=useState(false);
  const fmtAmt=(v,cur)=>cur==="CDF"?`${Math.round(v).toLocaleString()} CDF`:`$${parseFloat(v).toFixed(2)}`;
  const SOURCE_COLOR={whatsapp:"#25D366",instagram:"#E4405F",tiktok:"#888888",facebook:"#1877F2",direct:t.sec};
  const convRate = link.clicks>0?((link.conversions/link.clicks)*100).toFixed(1):0;

  const handleCopy=()=>{
    navigator.clipboard?.writeText(link.shortUrl).catch(()=>{});
    setCopied(true); setTimeout(()=>setCopied(false),2000);
  };

  return (
    <div style={{minHeight:"100%",background:t.bg}}>
      <div style={{background:t.card,borderBottom:`0.5px solid ${t.line}`,padding:"16px 18px 18px"}}>
        <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:6,marginBottom:14,padding:0}}>
          <Ico n="arL" size={16} color={t.sec}/><span style={{fontSize:12,color:t.sec}}>Retour</span>
        </button>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
          <div><H size={18}>{link.product}</H><div style={{fontSize:11,color:t.sec,marginTop:2}}>{link.merchant}</div></div>
          <Chip label={link.status==="active"?"Actif":link.status==="pending"?"En attente":link.status==="rejected"?"Refusé":"Verrouillé"} color={link.status==="active"?"green":link.status==="pending"?"amber":"red"}/>
        </div>
        <div style={{background:t.card2,borderRadius:10,padding:"9px 12px",marginTop:12,display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
          <span style={{fontSize:10,fontFamily:"monospace",color:t.sec,flex:1}}>{link.shortUrl}</span>
          <button onClick={handleCopy} style={{background:copied?t.green:t.primary,border:"none",borderRadius:8,padding:"5px 12px",color:copied?"#000":t.inv,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:F,flexShrink:0}}>
            {copied?"Copié !":"Copier"}
          </button>
        </div>
      </div>

      <div style={{padding:"16px 16px 100px"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
          {[
            ["Total généré", fmtAmt(link.net,link.currency), t.primary],
            ["Conversions", link.conversions, t.green],
            ["Clics", link.clicks, t.primary],
            ["Taux conv.", `${convRate}%`, t.amber],
          ].map(([l,v,col])=>(
            <Card key={l} style={{textAlign:"center",padding:"14px 10px"}}>
              <div style={{fontSize:22,fontWeight:800,color:col}}>{v}</div>
              <Lbl style={{marginTop:4}}>{l}</Lbl>
            </Card>
          ))}
        </div>

        {link.sales.length>0&&(
          <>
            <Lbl style={{marginBottom:10}}>Ventes générées via ce lien</Lbl>
            {link.sales.map((s,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 0",borderBottom:`0.5px solid ${t.line}`}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:32,height:32,borderRadius:"50%",background:t.card2,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <span style={{fontSize:10,fontWeight:700,color:t.sec}}>{s.initials}</span>
                  </div>
                  <div>
                    <div style={{fontSize:12,fontWeight:600,color:t.primary}}>{s.buyer}</div>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginTop:2}}>
                      <div style={{width:6,height:6,borderRadius:"50%",background:SOURCE_COLOR[s.source]||t.sec,flexShrink:0}}/>
                      <span style={{fontSize:10,color:t.sec,textTransform:"capitalize"}}>{s.source}</span>
                      <span style={{fontSize:10,color:t.tert}}>· {s.date}</span>
                    </div>
                  </div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:13,fontWeight:700,color:t.primary}}>+{link.currency==="CDF"?`${Math.round(s.commission).toLocaleString()} CDF`:`$${s.commission.toFixed(2)}`}</div>
                  <div style={{fontSize:10,color:t.tert}}>{link.currency==="CDF"?`Achat: ${Math.round(s.amount/1000)}K CDF`:`Achat: $${s.amount}`}</div>
                </div>
              </div>
            ))}
          </>
        )}

        {link.sales.length===0&&(
          <div style={{textAlign:"center",padding:"30px 0",color:t.tert,fontSize:12}}>
            {link.status==="pending"?"En attente de validation du marchand…":link.status==="rejected"?"Achat refusé par le marchand.":"Aucune vente via ce lien pour l'instant."}
          </div>
        )}
      </div>
    </div>
  );
}

function CustomerLinks() {
  const {dark}=useTheme(); const t=Tk(dark);
  const [activeTab,setActiveTab]=useState("active");
  const [tick,setTick]=useState(0);

  // Merge REFERRAL_LINKS with live SharedOrdersDB status
  const getLiveLinks = () => REFERRAL_LINKS.map(l=>{
    // Find matching order in SharedOrdersDB
    const order = SharedOrdersDB.getByCreator("usr_customer")
      .find(o=>o.productId===l.id.replace("l","p")||
               o.productName===l.product);
    if(order) {
      if(order.status==="validated") return {...l,status:"active"};
      if(order.status==="rejected")  return {...l,status:"rejected",rejectedReason:order.rejectedReason};
      if(order.status==="pending")   return {...l,status:"pending",pendingSince:order.date+" "+order.time};
    }
    return l;
  });
  const liveLinks = getLiveLinks();
  const [detail,setDetail]=useState(null);
  const [copied,setCopied]=useState(null);

  const activeLinks   = liveLinks.filter(l=>l.status==="active");
  const pendingLinks  = liveLinks.filter(l=>l.status==="pending");
  const rejectedLinks = liveLinks.filter(l=>l.status==="rejected"||l.status==="locked");

  const totalGenUSD = liveLinks.filter(l=>l.currency==="USD").reduce((s,l)=>s+l.net,0);
  const totalClicks = liveLinks.reduce((s,l)=>s+l.clicks,0);
  const totalConv   = liveLinks.reduce((s,l)=>s+l.conversions,0);

  const handleCopy=(id,url)=>{
    navigator.clipboard?.writeText(url).catch(()=>{});
    setCopied(id); setTimeout(()=>setCopied(null),2000);
  };

  if(detail) return <LinkDetailView link={detail} onBack={()=>setDetail(null)}/>;

  const fmtAmt=(v,cur)=>cur==="CDF"?`${Math.round(v).toLocaleString()} CDF`:`$${parseFloat(v).toFixed(2)}`;

  const LinkCard=({l})=>(
    <div onClick={()=>setDetail(l)}
      style={{background:t.card,border:`0.5px solid ${l.status==="active"?t.line:l.status==="pending"?t.amber+"40":t.red+"30"}`,borderRadius:16,padding:"14px 16px",marginBottom:10,cursor:"pointer",boxShadow:t.shadow}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
        <div style={{flex:1}}>
          <div style={{fontSize:14,fontWeight:700,color:t.primary}}>{l.product}</div>
          <div style={{fontSize:11,color:t.sec,marginTop:1}}>{l.merchant}</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
          <Chip label={l.status==="active"?"Actif":l.status==="pending"?"En attente":l.status==="rejected"?"Refusé":"Verrouillé"} color={l.status==="active"?"green":l.status==="pending"?"amber":"red"}/>
          {l.status==="active"&&<div style={{fontSize:14,fontWeight:800,color:t.primary}}>{fmtAmt(l.net,l.currency)}</div>}
        </div>
      </div>

      {l.status==="active"&&(
        <>
          <div style={{display:"flex",gap:6,marginBottom:10}}>
            {[["Clics",l.clicks],["Ventes",l.conversions],[`${l.clicks>0?((l.conversions/l.clicks)*100).toFixed(0):0}%`,"Taux"]].map(([v,lb])=>(
              <div key={String(lb)} style={{flex:1,textAlign:"center",background:t.card2,borderRadius:8,padding:"7px 0"}}>
                <div style={{fontSize:14,fontWeight:700,color:t.primary}}>{v}</div>
                <div style={{fontSize:9,color:t.sec,marginTop:1}}>{lb}</div>
              </div>
            ))}
          </div>
          <div style={{background:t.card2,borderRadius:8,padding:"7px 10px",fontFamily:"monospace",fontSize:10,color:t.sec,marginBottom:10}}>{l.shortUrl}</div>
          <div style={{display:"flex",gap:6}} onClick={e=>e.stopPropagation()}>
            <button onClick={()=>handleCopy(l.id,l.shortUrl)}
              style={{flex:1,padding:"9px 0",borderRadius:10,border:`0.5px solid ${t.line2}`,background:copied===l.id?t.green:"transparent",color:copied===l.id?"#000":t.primary,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:F}}>
              {copied===l.id?"Copié !":"Copier le lien"}
            </button>
            <button
              onClick={()=>{
                if(navigator.share){navigator.share({title:l.product,text:"Achetez via mon lien SWIIN !",url:l.shortUrl}).catch(()=>{});}
                else{navigator.clipboard?.writeText(l.shortUrl).catch(()=>{});alert("Lien copié : "+l.shortUrl);}
              }}
              style={{flex:1,padding:"9px 0",borderRadius:10,border:"none",background:t.primary,color:t.inv,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:F}}>
              Partager
            </button>
          </div>
        </>
      )}

      {l.status==="pending"&&(
        <div style={{background:t.aL,borderRadius:10,padding:"8px 10px",display:"flex",alignItems:"center",gap:8}}>
          <Ico n="clock" size={13} color={t.amber}/>
          <span style={{fontSize:11,color:t.amber}}>En attente depuis {l.pendingSince}</span>
        </div>
      )}

      {(l.status==="rejected"||l.status==="locked")&&(
        <div style={{background:t.rL,borderRadius:10,padding:"8px 10px"}}>
          <div style={{fontSize:11,color:t.red,fontWeight:600,marginBottom:2}}>
            {l.status==="locked"?"Lien verrouillé — frais SWIIN impayés":"Refusé par le marchand"}
          </div>
          {l.rejectedReason&&<div style={{fontSize:10,color:t.red,opacity:0.8}}>{l.rejectedReason}</div>}
          {l.rejectedAt&&<div style={{fontSize:10,color:t.tert,marginTop:2}}>{l.rejectedAt}</div>}
        </div>
      )}

      <div style={{display:"flex",alignItems:"center",justifyContent:"flex-end",gap:4,marginTop:8}}>
        <span style={{fontSize:10,color:t.tert}}>Voir le détail</span>
        <Ico n="arR" size={12} color={t.tert}/>
      </div>
    </div>
  );

  return (
    <div style={{padding:"20px 16px 100px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div><Lbl style={{marginBottom:4}}>MES LIENS</Lbl><H size={22}>Affiliation</H></div>
        <ThemeToggle/>
      </div>

      {/* Stats globales */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:16}}>
        {[["Total généré",`~$${totalGenUSD.toFixed(0)}`],[`${totalClicks}`,"Clics"],[`${totalConv}`,"Ventes"]].map(([v,l])=>(
          <Card key={l} style={{textAlign:"center",padding:"12px 8px"}}>
            <div style={{fontSize:18,fontWeight:800,color:t.primary}}>{v}</div>
            <Lbl style={{marginTop:3}}>{l}</Lbl>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div style={{display:"flex",background:t.card2,borderRadius:12,padding:3,marginBottom:16,gap:3}}>
        {[["active","Actifs",activeLinks.length],["pending","En attente",pendingLinks.length],["rejected","Refusés/Bloqués",rejectedLinks.length]].map(([id,label,count])=>(
          <button key={id} onClick={()=>setActiveTab(id)}
            style={{flex:1,padding:"8px 4px",borderRadius:10,border:"none",background:activeTab===id?t.primary:"transparent",color:activeTab===id?t.inv:t.sec,fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:F}}>
            {label} {count>0&&<span style={{opacity:0.7}}>({count})</span>}
          </button>
        ))}
      </div>

      {/* Actifs */}
      {activeTab==="active"&&(
        activeLinks.length===0
          ? <div style={{textAlign:"center",padding:"30px 0",color:t.tert,fontSize:12}}>Aucun lien actif pour l'instant.<br/>Achetez un produit pour débloquer votre premier lien.</div>
          : activeLinks.map(l=><LinkCard key={l.id} l={l}/>)
      )}

      {/* En attente */}
      {activeTab==="pending"&&(
        pendingLinks.length===0
          ? <div style={{textAlign:"center",padding:"30px 0",color:t.tert,fontSize:12}}>Aucune demande en attente.</div>
          : pendingLinks.map(l=><LinkCard key={l.id} l={l}/>)
      )}

      {/* Refusés / Verrouillés */}
      {activeTab==="rejected"&&(
        rejectedLinks.length===0
          ? <div style={{textAlign:"center",padding:"30px 0",color:t.tert,fontSize:12}}>Aucun lien refusé.</div>
          : rejectedLinks.map(l=><LinkCard key={l.id} l={l}/>)
      )}
    </div>
  );
}


function CustomerProfile({ onLogout, walletCurrency='USD', setWalletCurrency }) {
  const {dark}=useTheme(); const t=Tk(dark);
  const {profile,updateProfile}=useAuth();
  const [section,setSection]=useState(null);
  const unpaidFees=(profile?.walletSnapshot?.unpaidFees||0)/100;
  const totalWithdrawn=8.50+20.00;
  const totalFeesDue=(totalWithdrawn*0.10).toFixed(2);

  if(section==="settings") return <ProfileSettings onBack={()=>setSection(null)} profile={profile} updateProfile={updateProfile} walletCurrency={walletCurrency} setWalletCurrency={setWalletCurrency}/>;
  if(section==="notifications") return <ProfileNotifications onBack={()=>setSection(null)}/>;
  if(section==="security") return <ProfileSecurity onBack={()=>setSection(null)} onLogout={onLogout}/>;
  if(section==="privacy") return <ProfilePrivacy onBack={()=>setSection(null)}/>;
  if(section==="fees") return <ProfileFees onBack={()=>setSection(null)} totalWithdrawn={totalWithdrawn} totalFeesDue={totalFeesDue}/>;
  if(section==="invite") return <ProfileInvite onBack={()=>setSection(null)} slug={profile?.referralSlug||"dieumk"}/>;

  return (
    <div style={{padding:"20px 16px 100px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div><Lbl style={{marginBottom:4}}>MON PROFIL</Lbl><H size={22}>Compte</H></div>
        <ThemeToggle/>
      </div>

      {/* Avatar + infos */}
      <Card style={{marginBottom:16,textAlign:"center"}}>
        <div style={{width:72,height:72,borderRadius:"50%",background:t.card2,border:`0.5px solid ${t.line2}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"}}>
          <span style={{fontSize:26,fontWeight:700,color:t.sec}}>{profile?.displayName?.[0]||"D"}</span>
        </div>
        <H size={17}>{profile?.displayName||"Utilisateur"}</H>
        <div style={{fontSize:12,color:t.sec,marginTop:3}}>{profile?.email}</div>
        <div style={{fontSize:11,color:t.tert,marginTop:2,fontFamily:"monospace"}}>swiin.app/r/{profile?.referralSlug}</div>
        <div style={{marginTop:10,display:"flex",justifyContent:"center",gap:6}}>
          <Chip label="Créateur" color="green"/>
          {unpaidFees>0&&<Chip label="Frais dus" color="amber"/>}
          {profile?.phoneVerified&&<Chip label="Vérifié" color="green"/>}
        </div>
      </Card>

      {/* Sections */}
      {[
        {id:"settings",    icon:"settings", label:"Paramètres",         sub:"Langue, devise, thème"},
        {id:"notifications",icon:"bell",   label:"Notifications",       sub:"Gérer vos alertes"},
        {id:"security",    icon:"shield",   label:"Sécurité",            sub:"Mot de passe, OTP, déconnexion"},
        {id:"privacy",     icon:"eye",      label:"Confidentialité",     sub:"Présentation SWIIN, conditions"},
        {id:"fees",        icon:"percent",  label:"Mes frais SWIIN",     sub:`Total dû : $${totalFeesDue}`},
        {id:"invite",      icon:"users",    label:"Inviter un ami",      sub:"Partagez votre lien de parrainage"},
      ].map(item=>(
        <div key={item.id} onClick={()=>setSection(item.id)}
          style={{background:t.card,border:`0.5px solid ${item.id==="fees"&&unpaidFees>0?t.amber+"50":t.line}`,borderRadius:14,padding:"13px 16px",marginBottom:8,cursor:"pointer",boxShadow:t.shadow,display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:38,height:38,borderRadius:12,background:t.card2,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <Ico n={item.icon} size={17} color={item.id==="fees"&&unpaidFees>0?t.amber:t.sec}/>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:600,color:t.primary}}>{item.label}</div>
            <div style={{fontSize:11,color:item.id==="fees"&&unpaidFees>0?t.amber:t.sec,marginTop:1}}>{item.sub}</div>
          </div>
          <Ico n="arR" size={15} color={t.tert}/>
        </div>
      ))}

      <Btn v="danger" icon="logout" style={{marginTop:16}} onClick={onLogout}>Se déconnecter</Btn>
    </div>
  );
}

// ── Sub-screens ────────────────────────────────────────────────────────────────
function ProfileBack({ label, onBack }) {
  const {dark}=useTheme(); const t=Tk(dark);
  return (
    <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:6,marginBottom:20,padding:0}}>
      <Ico n="arL" size={16} color={t.sec}/><span style={{fontSize:12,color:t.sec}}>{label||"Retour"}</span>
    </button>
  );
}

function ProfileSettings({ onBack, profile, updateProfile, walletCurrency:initCurrency='USD', setWalletCurrency }) {
  const {dark,toggle}=useTheme(); const t=Tk(dark);
  const [lang,setLang]=useState("fr");
  const [currency,setCurrency]=useState(initCurrency);
  return (
    <div style={{padding:"20px 16px 100px"}}>
      <ProfileBack onBack={onBack}/>
      <Lbl style={{marginBottom:4}}>PARAMÈTRES</Lbl><H size={22} style={{marginBottom:20}}>Préférences</H>

      <Lbl style={{marginBottom:8}}>Langue</Lbl>
      <div style={{display:"flex",gap:8,marginBottom:18}}>
        {[["fr","Français"],["en","English"]].map(([id,label])=>(
          <button key={id} onClick={()=>setLang(id)}
            style={{flex:1,padding:"11px 0",borderRadius:12,border:`0.5px solid ${lang===id?t.primary:t.line}`,background:lang===id?t.primary:"transparent",color:lang===id?t.inv:t.sec,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:F}}>
            {label}
          </button>
        ))}
      </div>

      <Lbl style={{marginBottom:8}}>Devise préférée</Lbl>
      <div style={{display:"flex",gap:8,marginBottom:18}}>
        {[["USD","$ Dollar"],["CDF","FC Franc"]].map(([id,label])=>(
          <button key={id} onClick={()=>setCurrency(id)}
            style={{flex:1,padding:"11px 0",borderRadius:12,border:`0.5px solid ${currency===id?t.primary:t.line}`,background:currency===id?t.primary:"transparent",color:currency===id?t.inv:t.sec,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:F}}>
            {label}
          </button>
        ))}
      </div>

      <Lbl style={{marginBottom:8}}>Thème</Lbl>
      <div style={{display:"flex",gap:8,marginBottom:20}}>
        {[["dark","Mode sombre"],["light","Mode clair"]].map(([id,label])=>(
          <button key={id} onClick={toggle}
            style={{flex:1,padding:"11px 0",borderRadius:12,border:`0.5px solid ${dark===(id==="dark")?t.primary:t.line}`,background:dark===(id==="dark")?t.primary:"transparent",color:dark===(id==="dark")?t.inv:t.sec,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:F}}>
            {label}
          </button>
        ))}
      </div>

      <Btn onClick={()=>{updateProfile({preferredLanguage:lang,preferredCurrency:currency});if(setWalletCurrency)setWalletCurrency(currency);onBack();}}>Enregistrer les modifications</Btn>
    </div>
  );
}

function ProfileNotifications({ onBack }) {
  const {dark}=useTheme(); const t=Tk(dark);
  const [notifs,setNotifs]=useState({
    newCommission:true, withdrawalApproved:true, linkValidated:true,
    feesReminder:true, newSale:true, marketing:false,
  });
  const toggle=(k)=>setNotifs(n=>({...n,[k]:!n[k]}));
  const items=[
    {key:"newCommission",    label:"Nouvelle commission",        sub:"Quand une vente est générée via votre lien"},
    {key:"withdrawalApproved",label:"Retrait approuvé",         sub:"Quand un marchand approuve votre demande"},
    {key:"linkValidated",   label:"Lien validé",                sub:"Quand un marchand valide votre achat"},
    {key:"feesReminder",    label:"Rappel frais SWIIN",         sub:"Quand des frais restent à régler"},
    {key:"newSale",         label:"Vente via votre lien",       sub:"Chaque achat effectué via vos liens"},
    {key:"marketing",       label:"Actualités SWIIN",           sub:"Nouvelles fonctionnalités et offres"},
  ];
  return (
    <div style={{padding:"20px 16px 100px"}}>
      <ProfileBack onBack={onBack}/>
      <Lbl style={{marginBottom:4}}>NOTIFICATIONS</Lbl><H size={22} style={{marginBottom:20}}>Alertes</H>
      {items.map(item=>(
        <div key={item.key} style={{background:t.card,border:`0.5px solid ${t.line}`,borderRadius:14,padding:"13px 16px",marginBottom:8,display:"flex",alignItems:"center",gap:12,boxShadow:t.shadow}}>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:600,color:t.primary}}>{item.label}</div>
            <div style={{fontSize:11,color:t.sec,marginTop:1}}>{item.sub}</div>
          </div>
          <div onClick={()=>toggle(item.key)}
            style={{width:44,height:26,borderRadius:13,background:notifs[item.key]?t.green:t.card2,border:`0.5px solid ${notifs[item.key]?t.green:t.line2}`,cursor:"pointer",position:"relative",transition:"all 0.2s",flexShrink:0}}>
            <div style={{position:"absolute",top:3,left:notifs[item.key]?20:3,width:20,height:20,borderRadius:"50%",background:notifs[item.key]?"#000":t.sec,transition:"left 0.2s"}}/>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProfileSecurity({ onBack, onLogout }) {
  const {dark}=useTheme(); const t=Tk(dark);
  const [view,setView]=useState("menu"); // menu | password | otp
  const [form,setForm]=useState({old:"",newP:"",confirm:""});
  const [errors,setErrors]=useState({});
  const [success,setSuccess]=useState(false);
  const set=k=>e=>{setErrors({});setForm(f=>({...f,[k]:e.target.value}));};

  const handleChangePwd=()=>{
    const e={};
    if(!form.old) e.old="Requis";
    if(form.newP.length<6) e.newP="Au moins 6 caractères";
    if(form.newP!==form.confirm) e.confirm="Ne correspondent pas";
    setErrors(e); if(Object.keys(e).length>0) return;
    setSuccess(true); setTimeout(()=>{setSuccess(false);setView("menu");},2000);
  };

  if(view==="password") return (
    <div style={{padding:"20px 16px 100px"}}>
      <ProfileBack onBack={()=>setView("menu")} label="Sécurité"/>
      <Lbl style={{marginBottom:4}}>SÉCURITÉ</Lbl><H size={22} style={{marginBottom:20}}>Mot de passe</H>
      {success&&<SuccessBanner message="Mot de passe modifié avec succès !"/>}
      <TextInput label="Mot de passe actuel" icon="lock" type="password" value={form.old} onChange={set("old")} placeholder="••••••••" error={errors.old}/>
      <TextInput label="Nouveau mot de passe" icon="lock" type="password" value={form.newP} onChange={set("newP")} placeholder="Au moins 6 caractères" error={errors.newP}/>
      <TextInput label="Confirmer" icon="lock" type="password" value={form.confirm} onChange={set("confirm")} placeholder="Répétez" error={errors.confirm}/>
      <Btn onClick={handleChangePwd}>Modifier le mot de passe</Btn>
      <div style={{textAlign:"center",marginTop:12}}>
        <span style={{fontSize:12,color:t.sec,cursor:"pointer",textDecoration:"underline"}} onClick={()=>{}}>Réinitialiser par email</span>
      </div>
    </div>
  );

  return (
    <div style={{padding:"20px 16px 100px"}}>
      <ProfileBack onBack={onBack}/>
      <Lbl style={{marginBottom:4}}>SÉCURITÉ</Lbl><H size={22} style={{marginBottom:20}}>Sécurité</H>
      {[
        {icon:"lock",  label:"Modifier le mot de passe", sub:"Changez votre mot de passe", action:()=>setView("password")},
        {icon:"phone", label:"Vérification téléphone",    sub:"Numéro vérifié ✓", action:()=>{}},
        {icon:"logout",label:"Déconnecter tous les appareils", sub:"Session actuelle et autres appareils", action:onLogout},
      ].map(item=>(
        <div key={item.label} onClick={item.action}
          style={{background:t.card,border:`0.5px solid ${item.icon==="logout"?t.red+"30":t.line}`,borderRadius:14,padding:"13px 16px",marginBottom:8,cursor:"pointer",boxShadow:t.shadow,display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:38,height:38,borderRadius:12,background:item.icon==="logout"?t.rL:t.card2,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <Ico n={item.icon} size={17} color={item.icon==="logout"?t.red:t.sec}/>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:600,color:item.icon==="logout"?t.red:t.primary}}>{item.label}</div>
            <div style={{fontSize:11,color:t.sec,marginTop:1}}>{item.sub}</div>
          </div>
          <Ico n="arR" size={15} color={t.tert}/>
        </div>
      ))}
    </div>
  );
}

function ProfilePrivacy({ onBack }) {
  const {dark}=useTheme(); const t=Tk(dark);
  const [view,setView]=useState("menu");

  if(view==="about") return (
    <div style={{padding:"20px 16px 100px"}}>
      <ProfileBack onBack={()=>setView("menu")} label="Confidentialité"/>
      <Lbl style={{marginBottom:4}}>À PROPOS</Lbl><H size={22} style={{marginBottom:20}}>SWIIN</H>
      <Card style={{marginBottom:14}}>
        <div style={{textAlign:"center",marginBottom:16}}>
          <div style={{fontSize:36,fontWeight:800,letterSpacing:-1}}><span style={{color:t.primary}}>SWI</span><span style={{color:t.green}}>IN</span></div>
          <div style={{fontSize:11,letterSpacing:3,color:t.sec,marginTop:4}}>ACHETEZ · PARTAGEZ · GAGNEZ</div>
        </div>
        <div style={{fontSize:12,color:t.sec,lineHeight:1.9}}>
          SWIIN est une plateforme de <strong style={{color:t.primary}}>social commerce africain</strong> qui permet à chacun de devenir créateur et de gagner des commissions en partageant les produits et services des marchands locaux.
        </div>
      </Card>
      <Card style={{marginBottom:14}}>
        <Lbl style={{marginBottom:10}}>Comment ça marche</Lbl>
        {[
          ["1","Achetez un produit chez un marchand SWIIN"],
          ["2","Obtenez votre lien d'affiliation unique"],
          ["3","Partagez sur WhatsApp, Instagram, TikTok..."],
          ["4","Gagnez une commission sur chaque vente via votre lien"],
          ["5","Retirez vos gains directement chez le marchand"],
        ].map(([n,text])=>(
          <div key={n} style={{display:"flex",gap:12,marginBottom:12,alignItems:"flex-start"}}>
            <div style={{width:24,height:24,borderRadius:"50%",background:t.primary,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <span style={{fontSize:11,fontWeight:700,color:t.inv}}>{n}</span>
            </div>
            <div style={{fontSize:12,color:t.sec,lineHeight:1.6,marginTop:2}}>{text}</div>
          </div>
        ))}
      </Card>
      <Card>
        <div style={{fontSize:11,color:t.tert,textAlign:"center",lineHeight:1.7}}>Version 1.0.0 · SWIIN TECH SARL<br/>Kinshasa, République Démocratique du Congo</div>
      </Card>
    </div>
  );

  return (
    <div style={{padding:"20px 16px 100px"}}>
      <ProfileBack onBack={onBack}/>
      <Lbl style={{marginBottom:4}}>CONFIDENTIALITÉ</Lbl><H size={22} style={{marginBottom:20}}>Confidentialité</H>
      {[
        {icon:"eye",   label:"Présentation SWIIN",     sub:"À propos de la plateforme",       action:()=>setView("about")},
        {icon:"shield",label:"Conditions d'utilisation",sub:"Termes et conditions",           action:()=>{}},
        {icon:"lock",  label:"Politique de confidentialité",sub:"Protection de vos données", action:()=>{}},
      ].map(item=>(
        <div key={item.label} onClick={item.action}
          style={{background:t.card,border:`0.5px solid ${t.line}`,borderRadius:14,padding:"13px 16px",marginBottom:8,cursor:"pointer",boxShadow:t.shadow,display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:38,height:38,borderRadius:12,background:t.card2,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <Ico n={item.icon} size={17} color={t.sec}/>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:600,color:t.primary}}>{item.label}</div>
            <div style={{fontSize:11,color:t.sec,marginTop:1}}>{item.sub}</div>
          </div>
          <Ico n="arR" size={15} color={t.tert}/>
        </div>
      ))}
    </div>
  );
}

function ProfileFees({ onBack, totalWithdrawn, totalFeesDue }) {
  const {dark}=useTheme(); const t=Tk(dark);
  const feesPaid=3.20;
  const feesRemaining=(parseFloat(totalFeesDue)-feesPaid).toFixed(2);

  const feeHistory=[
    {id:"WD-001",merchant:"Jordan Store",withdrawn:20.00,fee:2.00,date:"5 juin 2026",status:"paid"},
    {id:"WD-002",merchant:"Barber Lux",withdrawn:8.50,fee:0.85,date:"3 juin 2026",status:"pending"},
  ];

  return (
    <div style={{padding:"20px 16px 100px"}}>
      <ProfileBack onBack={onBack}/>
      <Lbl style={{marginBottom:4}}>MES FRAIS SWIIN</Lbl><H size={22} style={{marginBottom:20}}>Frais & Commissions</H>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
        {[
          ["Total retiré",     `$${totalWithdrawn.toFixed(2)}`, t.primary],
          ["Total frais (10%)",`$${totalFeesDue}`,              t.amber],
          ["Frais réglés",     `$${feesPaid.toFixed(2)}`,       t.green],
          ["Solde frais dûs",  `$${feesRemaining}`,             parseFloat(feesRemaining)>0?t.red:t.green],
        ].map(([l,v,col])=>(
          <Card key={l} style={{textAlign:"center",padding:"14px 10px"}}>
            <div style={{fontSize:20,fontWeight:800,color:col}}>{v}</div>
            <Lbl style={{marginTop:4}}>{l}</Lbl>
          </Card>
        ))}
      </div>

      <div style={{background:t.card2,border:`0.5px solid ${t.line2}`,borderRadius:12,padding:"11px 14px",marginBottom:18}}>
        <div style={{fontSize:12,color:t.sec,lineHeight:1.7}}>
          Les frais SWIIN représentent <strong style={{color:t.primary}}>10% de chaque retrait confirmé</strong>. Ils sont dus uniquement quand vous avez réellement reçu votre argent.
        </div>
      </div>

      <Lbl style={{marginBottom:10}}>Historique par retrait</Lbl>
      {feeHistory.map(f=>(
        <div key={f.id} style={{background:t.card,border:`0.5px solid ${f.status==="paid"?t.gM:t.amber+"40"}`,borderRadius:14,padding:"13px 16px",marginBottom:8,boxShadow:t.shadow}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
            <div>
              <div style={{fontSize:13,fontWeight:600,color:t.primary}}>{f.merchant}</div>
              <div style={{fontSize:10,color:t.sec,marginTop:1}}>{f.date} · #{f.id}</div>
            </div>
            <Chip label={f.status==="paid"?"Réglé":"En attente"} color={f.status==="paid"?"green":"amber"}/>
          </div>
          <div style={{display:"flex",gap:8}}>
            {[["Retiré",`$${f.withdrawn.toFixed(2)}`],["Frais (10%)",`$${f.fee.toFixed(2)}`]].map(([l,v])=>(
              <div key={l} style={{flex:1,background:t.card2,borderRadius:8,padding:"7px 10px"}}>
                <div style={{fontSize:9,color:t.tert,textTransform:"uppercase",letterSpacing:0.4}}>{l}</div>
                <div style={{fontSize:13,fontWeight:700,color:t.primary,marginTop:2}}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ProfileInvite({ onBack, slug }) {
  const {dark}=useTheme(); const t=Tk(dark);
  const [copied,setCopied]=useState(false);
  const inviteUrl=`swiin.app/invite/${slug}`;
  const handleCopy=()=>{
    navigator.clipboard?.writeText(inviteUrl).catch(()=>{});
    setCopied(true); setTimeout(()=>setCopied(false),2000);
  };

  const friends=[
    {name:"Amina B.",status:"inscrit",date:"10 juin"},
    {name:"Patrick M.",status:"premier lien",date:"8 juin"},
    {name:"Jules K.",status:"invite",date:"5 juin"},
  ];
  const statusColor={inscrit:"green","premier lien":"green",invite:"amber"};
  const statusLabel={inscrit:"Inscrit",  "premier lien":"1er lien généré",invite:"Invitation envoyée"};

  return (
    <div style={{padding:"20px 16px 100px"}}>
      <ProfileBack onBack={onBack}/>
      <Lbl style={{marginBottom:4}}>PARRAINAGE</Lbl><H size={22} style={{marginBottom:20}}>Inviter un ami</H>

      <Card style={{marginBottom:16,textAlign:"center"}}>
        <div style={{width:56,height:56,borderRadius:"50%",background:t.gL,border:`0.5px solid ${t.gM}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"}}>
          <Ico n="users" size={24} color={t.green}/>
        </div>
        <H size={16} style={{marginBottom:6}}>Invitez vos amis sur SWIIN</H>
        <div style={{fontSize:12,color:t.sec,lineHeight:1.7,marginBottom:16}}>Partagez votre lien et aidez votre entourage à découvrir SWIIN et gagner des commissions.</div>
        <div style={{background:t.card2,borderRadius:10,padding:"10px 12px",fontFamily:"monospace",fontSize:12,color:t.primary,marginBottom:12}}>{inviteUrl}</div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={handleCopy}
            style={{flex:1,padding:"11px 0",borderRadius:12,border:`0.5px solid ${t.line2}`,background:copied?t.green:"transparent",color:copied?"#000":t.primary,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:F}}>
            {copied?"Copié !":"Copier le lien"}
          </button>
          <button style={{flex:1,padding:"11px 0",borderRadius:12,border:"none",background:"#25D366",color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:F}}>
            WhatsApp
          </button>
        </div>
      </Card>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:16}}>
        {[["3","Invités"],["2","Inscrits"],["1","Actif"]].map(([v,l])=>(
          <Card key={l} style={{textAlign:"center",padding:"12px 8px"}}>
            <div style={{fontSize:22,fontWeight:800,color:t.primary}}>{v}</div>
            <Lbl style={{marginTop:3}}>{l}</Lbl>
          </Card>
        ))}
      </div>

      <Lbl style={{marginBottom:10}}>Vos invités</Lbl>
      {friends.map(f=>(
        <div key={f.name} style={{background:t.card,border:`0.5px solid ${t.line}`,borderRadius:14,padding:"12px 14px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:t.shadow}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:32,height:32,borderRadius:"50%",background:t.card2,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span style={{fontSize:11,fontWeight:700,color:t.sec}}>{f.name[0]}</span>
            </div>
            <div>
              <div style={{fontSize:13,fontWeight:600,color:t.primary}}>{f.name}</div>
              <div style={{fontSize:10,color:t.tert,marginTop:1}}>{f.date}</div>
            </div>
          </div>
          <Chip label={statusLabel[f.status]||f.status} color={statusColor[f.status]||"amber"}/>
        </div>
      ))}
    </div>
  );
}


function MerchantDashboardTab() {
  const {dark}=useTheme(); const t=Tk(dark);
  const [pdfDone,setPdfDone]=useState(false);
  return (
    <div style={{padding:"20px 16px 100px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
        <div><Lbl style={{marginBottom:4}}>TABLEAU DE BORD</Lbl><H size={22}>Jordan Store</H></div>
        <div style={{display:"flex",gap:8}}><Chip label="Retail" color="purple"/><ThemeToggle/></div></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
        <StatCard label="Ventes ce mois" value="$2 410" color={t.primary}/>
        <StatCard label="Commissions dues" value="$241" color={t.primary}/>
        <StatCard label="Affiliés actifs" value="34" color={t.primary}/>
        <StatCard label="Affiliés verrouillés" value="2" color={t.amber}/></div>
      <Card style={{marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}><Lbl>Revenus — 7 jours</Lbl><Chip label="+18%" color="green"/></div>
        <MiniBar data={[180,320,250,480,410,590,520]}/>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:8}}>{["L","M","M","J","V","S","D"].map(d=><div key={d} style={{flex:1,textAlign:"center",fontSize:9,color:t.tert}}>{d}</div>)}</div>
      </Card>
      {}
      <Card style={{marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <div><div style={{fontSize:13,fontWeight:600,color:t.primary}}>Lien boutique</div><div style={{fontSize:10,fontFamily:"monospace",color:t.sec,marginTop:3}}>swiin.app/store/jordan-store</div></div>
          <Ico n="copy" size={16} color={t.sec}/></div>
        <div style={{display:"flex",gap:6}}>
          {["WhatsApp","Instagram","TikTok"].map(s=><button key={s} style={{flex:1,padding:"8px 0",borderRadius:10,border:`0.5px solid ${t.line2}`,background:"transparent",color:t.sec,fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:F}}>{s}</button>)}
        </div>
      </Card>
      {}
      <Lbl style={{marginBottom:10}}>Top affiliés</Lbl>
      {[["Dieumerci K.","$28.00","active"],["Amina B.","$19.20","locked"],["Patrick M.","$39.00","active"]].map(([n,e,s])=>(
        <Card key={n} style={{marginBottom:8}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:32,height:32,borderRadius:"50%",background:t.card2,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:11,fontWeight:700,color:t.sec}}>{n[0]}</span></div>
              <div style={{fontSize:13,fontWeight:500,color:t.primary}}>{n}</div></div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:13,fontWeight:700,color:t.primary}}>{e}</span>
              <Chip label={s==="active"?"Actif":"Verrouillé"} color={s==="active"?"green":"red"}/></div></div>
        </Card>
      ))}
      {}
      <Card style={{marginTop:4}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <div><div style={{fontSize:13,fontWeight:600,color:t.primary}}>Rapport PDF mensuel</div><div style={{fontSize:11,color:t.sec,marginTop:2}}>Analytics · Commissions · Affiliés</div></div>
          <Ico n="download" size={18} color={t.sec}/></div>
        {!pdfDone?(
          <Btn v="ghost" icon="download" onClick={()=>setPdfDone(true)}>Générer le rapport</Btn>
        ):(
          <div style={{background:t.gL,borderRadius:12,padding:"12px 14px"}}>
            <div style={{fontSize:12,fontWeight:600,color:t.green,marginBottom:6}}>✓ Rapport prêt</div>
            <div style={{fontSize:11,color:t.sec,lineHeight:1.7}}>Jordan Store · Juin 2026<br/>CA : $2 410 · Comm. : $241 · Frais SWIIN : $24.10</div>
            <Btn v="green" icon="download" style={{marginTop:10}} onClick={()=>setPdfDone(false)}>Télécharger PDF</Btn>
          </div>
        )}
      </Card></div>);
}

function MerchantProductsTab() {
  const {dark}=useTheme(); const t=Tk(dark);
  const merchantData = MERCHANTS_CATALOG.find(m=>m.id==="mrc_jordan")||MERCHANTS_CATALOG[0];
  const [products,setProducts]=useState(merchantData.products.map(p=>({...p,active:true,currency:p.currency||"USD"})));
  const [adding,setAdding]=useState(false);
  const [editing,setEditing]=useState(null);
  const [form,setForm]=useState({name:"",desc:"",price:"",currency:"USD",commission:"",stock:""});
  const set=k=>e=>setForm(f=>({...f,[k]:e.target.value}));

  const handleAdd=()=>{
    if(!form.name||!form.price) return;
    const np={id:"p_"+Date.now(),name:form.name,desc:form.desc,price:parseFloat(form.price),currency:form.currency,commission:parseFloat(form.commission)||10,stock:parseInt(form.stock)||99,active:true};
    setProducts(p=>[np,...p]);
    setAdding(false);setForm({name:"",desc:"",price:"",currency:"USD",commission:"",stock:""});
  };
  const handleSave=()=>{
    setProducts(p=>p.map(x=>x.id===editing?{...x,...form,price:parseFloat(form.price),commission:parseFloat(form.commission),stock:parseInt(form.stock)}:x));
    setEditing(null);
  };
  const toggleActive=(id)=>setProducts(p=>p.map(x=>x.id===id?{...x,active:!x.active}:x));

  const ProductForm=({onSubmit,onCancel,submitLabel})=>(
    <Card style={{marginBottom:14,border:`0.5px solid ${t.line2}`}}>
      <Lbl style={{marginBottom:12}}>{submitLabel}</Lbl>
      {[["Nom du produit/service","name","text","Ex: Coupe premium"],["Description","desc","text","Courte description"],["Prix","price","number","0"],["Commission (%)","commission","number","10"],["Stock (99 = illimité)","stock","number","99"]].map(([l,f,tp,ph])=>(
        <div key={f} style={{marginBottom:10}}>
          <Lbl style={{marginBottom:4}}>{l}</Lbl>
          <input type={tp} value={form[f]||""} onChange={set(f)} placeholder={ph}
            style={{width:"100%",background:t.card2,border:`0.5px solid ${t.line2}`,borderRadius:12,padding:"11px 14px",color:t.primary,fontSize:13,fontFamily:F,outline:"none",boxSizing:"border-box"}}/>
        </div>
      ))}
      <Lbl style={{marginBottom:8}}>Devise</Lbl>
      <div style={{display:"flex",gap:8,marginBottom:14}}>
        {["USD","CDF"].map(cur=>(
          <button key={cur} onClick={()=>setForm(f=>({...f,currency:cur}))}
            style={{flex:1,padding:"9px 0",borderRadius:10,border:`0.5px solid ${form.currency===cur?t.primary:t.line}`,background:form.currency===cur?t.primary:"transparent",color:form.currency===cur?t.inv:t.sec,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:F}}>
            {cur==="USD"?"$ USD":"FC CDF"}
          </button>
        ))}
      </div>
      <div style={{display:"flex",gap:8}}>
        <Btn v="ghost" onClick={onCancel} style={{flex:1}}>Annuler</Btn>
        <Btn onClick={onSubmit} style={{flex:2}}>{submitLabel}</Btn>
      </div>
    </Card>
  );

  return (
    <div style={{padding:"20px 16px 100px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div><Lbl style={{marginBottom:4}}>CATALOGUE</Lbl><H size={22}>Produits</H></div>
        <button onClick={()=>{setAdding(true);setEditing(null);setForm({name:"",desc:"",price:"",currency:"USD",commission:"",stock:"99"});}}
          style={{background:t.primary,color:t.inv,border:"none",borderRadius:12,padding:"8px 16px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:F}}>
          + Ajouter
        </button>
      </div>

      {adding&&<ProductForm onSubmit={handleAdd} onCancel={()=>setAdding(false)} submitLabel="Ajouter le produit"/>}

      {products.map(p=>(
        <div key={p.id}>
          {editing===p.id?(
            <ProductForm onSubmit={handleSave} onCancel={()=>setEditing(null)} submitLabel="Enregistrer"/>
          ):(
            <div style={{background:t.card,border:`0.5px solid ${p.active?t.line:t.line}`,borderRadius:16,padding:"13px 16px",marginBottom:10,opacity:p.active?1:0.5,boxShadow:t.shadow}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
                <div style={{width:44,height:44,borderRadius:12,background:t.card2,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <Ico n="store" size={18} color={t.sec}/>
                </div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:3}}>
                    <div style={{fontSize:14,fontWeight:700,color:t.primary}}>{p.name}</div>
                    <div style={{fontSize:15,fontWeight:700,color:t.primary,flexShrink:0,marginLeft:8}}>
                      {p.currency==="CDF"?`${Math.round(p.price).toLocaleString()} FC`:`$${p.price}`}
                    </div>
                  </div>
                  {p.desc&&<div style={{fontSize:11,color:t.sec,marginBottom:6}}>{p.desc}</div>}
                  <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:8}}>
                    <Chip label={`${p.commission}% comm.`} color="green"/>
                    <span style={{fontSize:10,color:t.sec}}>Stock : {p.stock>=99?"Illimité":p.stock}</span>
                    <Chip label={p.active?"Actif":"Inactif"} color={p.active?"green":"red"}/>
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={()=>{setEditing(p.id);setAdding(false);setForm({name:p.name,desc:p.desc||"",price:String(p.price),currency:p.currency||"USD",commission:String(p.commission),stock:String(p.stock)});}}
                      style={{flex:1,padding:"8px 0",borderRadius:10,border:`0.5px solid ${t.line2}`,background:"transparent",color:t.sec,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:F}}>
                      Modifier
                    </button>
                    <button onClick={()=>toggleActive(p.id)}
                      style={{flex:1,padding:"8px 0",borderRadius:10,border:`0.5px solid ${p.active?t.red+"40":t.gM}`,background:p.active?t.rL:t.gL,color:p.active?t.red:t.green,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:F}}>
                      {p.active?"Désactiver":"Activer"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function MerchantOrdersTab() {
  const {dark}=useTheme(); const t=Tk(dark);
  const [orders,setOrders]=useState(()=>SharedOrdersDB.getByMerchant("mrc_jordan"));
  const [tab,setTab]=useState("pending");
  const [rejectId,setRejectId]=useState(null);
  const [rejectReason,setRejectReason]=useState("");

  const refresh=()=>setOrders([...SharedOrdersDB.getByMerchant("mrc_jordan")]);

  const handleValidate=(id)=>{
    SharedOrdersDB.validate(id);
    refresh();
  };
  const handleReject=(id)=>{
    SharedOrdersDB.reject(id, rejectReason||"Achat non reconnu");
    setRejectId(null); setRejectReason("");
    refresh();
  };

  const pending   = orders.filter(o=>o.status==="pending");
  const validated = orders.filter(o=>o.status==="validated");
  const rejected  = orders.filter(o=>o.status==="rejected");

  const fmtPrice=(price,currency)=>currency==="CDF"?`${Math.round(price).toLocaleString()} CDF`:`$${price}`;
  const commAmt=(price,rate,currency)=>currency==="CDF"?`${Math.round(price*rate/100).toLocaleString()} CDF`:`$${(price*rate/100).toFixed(2)}`;

  // Reject modal
  if(rejectId) {
    const ord=orders.find(o=>o.id===rejectId);
    return (
      <div style={{padding:"24px 18px 100px"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
          <button onClick={()=>setRejectId(null)} style={{background:"none",border:"none",cursor:"pointer"}}><Ico n="arL" size={20}/></button>
          <div><Lbl style={{marginBottom:3}}>REFUSER LA COMMANDE</Lbl><H size={18}>{ord?.creatorName}</H></div>
        </div>
        <Card style={{marginBottom:16}}>
          <div style={{fontSize:13,fontWeight:600,color:t.primary,marginBottom:4}}>{ord?.productName}</div>
          <div style={{fontSize:12,color:t.sec}}>{fmtPrice(ord?.price,ord?.currency)} · Commande #{ord?.id?.slice(-6)}</div>
        </Card>
        <Lbl style={{marginBottom:8}}>Raison du refus</Lbl>
        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
          {["Achat non reconnu","Paiement non reçu","Produit non disponible","Autre"].map(r=>(
            <div key={r} onClick={()=>setRejectReason(r)}
              style={{padding:"11px 14px",borderRadius:12,cursor:"pointer",border:`0.5px solid ${rejectReason===r?t.red+"60":t.line}`,background:rejectReason===r?t.rL:"transparent",fontSize:13,color:rejectReason===r?t.red:t.primary}}>
              {r}
            </div>
          ))}
        </div>
        <button onClick={()=>handleReject(rejectId)}
          disabled={!rejectReason}
          style={{width:"100%",padding:"13px",borderRadius:14,border:"none",background:rejectReason?t.red:t.card2,color:rejectReason?"#fff":t.sec,fontSize:14,fontWeight:700,cursor:rejectReason?"pointer":"not-allowed",fontFamily:F}}>
          Confirmer le refus
        </button>
      </div>
    );
  }

  return (
    <div style={{padding:"20px 16px 100px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div><Lbl style={{marginBottom:4}}>COMMANDES</Lbl><H size={22}>Validations</H></div>
        <ThemeToggle/>
      </div>

      {/* Stats */}
      <div style={{display:"flex",gap:8,marginBottom:16}}>
        <div style={{flex:1,background:t.aL,borderRadius:12,padding:"10px 12px",border:`0.5px solid ${t.amber}30`}}>
          <div style={{fontSize:20,fontWeight:800,color:t.amber}}>{pending.length}</div>
          <div style={{fontSize:9,color:t.amber,textTransform:"uppercase",letterSpacing:0.5,marginTop:2}}>À valider</div>
        </div>
        <div style={{flex:1,background:t.gL,borderRadius:12,padding:"10px 12px",border:`0.5px solid ${t.gM}`}}>
          <div style={{fontSize:20,fontWeight:800,color:t.green}}>{validated.length}</div>
          <div style={{fontSize:9,color:t.green,textTransform:"uppercase",letterSpacing:0.5,marginTop:2}}>Validées</div>
        </div>
        <div style={{flex:1,background:t.rL,borderRadius:12,padding:"10px 12px",border:`0.5px solid ${t.red}20`}}>
          <div style={{fontSize:20,fontWeight:800,color:t.red}}>{rejected.length}</div>
          <div style={{fontSize:9,color:t.red,textTransform:"uppercase",letterSpacing:0.5,marginTop:2}}>Refusées</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",background:t.card2,borderRadius:12,padding:3,marginBottom:16,gap:3}}>
        {[["pending","En attente",pending.length],["validated","Validées",validated.length],["rejected","Refusées",rejected.length]].map(([id,lb,count])=>(
          <button key={id} onClick={()=>setTab(id)}
            style={{flex:1,padding:"8px 4px",borderRadius:10,border:"none",background:tab===id?t.primary:"transparent",color:tab===id?t.inv:t.sec,fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:F}}>
            {lb} {count>0&&`(${count})`}
          </button>
        ))}
      </div>

      {/* En attente */}
      {tab==="pending"&&(
        pending.length===0
          ? <div style={{textAlign:"center",padding:"30px 0",color:t.tert,fontSize:12}}>Aucune commande en attente.</div>
          : pending.map(o=>(
            <div key={o.id} style={{background:t.card,border:`0.5px solid ${t.amber}40`,borderRadius:16,padding:"14px 16px",marginBottom:10,boxShadow:t.shadow}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                <div>
                  <div style={{fontSize:14,fontWeight:700,color:t.primary}}>{o.creatorName}</div>
                  <div style={{fontSize:11,color:t.sec,marginTop:2}}>{o.productName} · {o.date} {o.time}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:15,fontWeight:700,color:t.primary}}>{fmtPrice(o.price,o.currency)}</div>
                  <div style={{fontSize:10,color:t.sec}}>Comm. : {commAmt(o.price,o.commission,o.currency)}</div>
                </div>
              </div>
              <div style={{background:t.card2,borderRadius:10,padding:"8px 10px",marginBottom:10,fontSize:11,color:t.sec}}>
                Le créateur a effectué l'achat et attend votre validation pour débloquer son lien d'affiliation.
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>setRejectId(o.id)}
                  style={{flex:1,padding:"10px 0",borderRadius:12,border:`0.5px solid ${t.red}40`,background:t.rL,color:t.red,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:F}}>
                  Refuser
                </button>
                <button onClick={()=>handleValidate(o.id)}
                  style={{flex:2,padding:"10px 0",borderRadius:12,border:"none",background:t.green,color:"#000",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:F}}>
                  ✓ Valider — Débloquer le lien
                </button>
              </div>
            </div>
          ))
      )}

      {/* Validées */}
      {tab==="validated"&&(
        validated.length===0
          ? <div style={{textAlign:"center",padding:"30px 0",color:t.tert,fontSize:12}}>Aucune commande validée.</div>
          : validated.map(o=>(
            <div key={o.id} style={{background:t.card,border:`0.5px solid ${t.gM}`,borderRadius:16,padding:"14px 16px",marginBottom:10,boxShadow:t.shadow}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:t.primary}}>{o.creatorName}</div>
                  <div style={{fontSize:11,color:t.sec,marginTop:2}}>{o.productName} · {o.date}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:14,fontWeight:700,color:t.primary}}>{fmtPrice(o.price,o.currency)}</div>
                  <Chip label="Lien débloqué" color="green"/>
                </div>
              </div>
            </div>
          ))
      )}

      {/* Refusées */}
      {tab==="rejected"&&(
        rejected.length===0
          ? <div style={{textAlign:"center",padding:"30px 0",color:t.tert,fontSize:12}}>Aucune commande refusée.</div>
          : rejected.map(o=>(
            <div key={o.id} style={{background:t.card,border:`0.5px solid ${t.red}30`,borderRadius:16,padding:"14px 16px",marginBottom:10,boxShadow:t.shadow}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:t.primary}}>{o.creatorName}</div>
                  <div style={{fontSize:11,color:t.sec,marginTop:2}}>{o.productName} · {o.date}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:14,fontWeight:700,color:t.red}}>{fmtPrice(o.price,o.currency)}</div>
                  <Chip label="Refusée" color="red"/>
                </div>
              </div>
              {o.rejectedReason&&(
                <div style={{background:t.rL,borderRadius:10,padding:"7px 10px",fontSize:11,color:t.red}}>
                  Raison : {o.rejectedReason}
                </div>
              )}
            </div>
          ))
      )}
    </div>
  );
}


function MerchantAnalyticsTab() {
  const {dark}=useTheme(); const t=Tk(dark);
  return (
    <div style={{padding:"20px 16px 100px"}}>
      <PageHeader title="Analytics" right={<ThemeToggle/>}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
        <StatCard label="CA total" value="$8 240"/>
        <StatCard label="Commissions" value="$824"/>
        <StatCard label="Frais SWIIN" value="$82.40" color={t.amber}/>
        <StatCard label="Affiliés actifs" value="32" color={t.green}/></div>
      <Card style={{marginBottom:14}}>
        <Lbl style={{marginBottom:12}}>Ventes — 7 jours</Lbl>
        <MiniBar data={[180,320,250,480,410,590,520]}/>
      </Card>
      <Card style={{marginBottom:14}}>
        <Lbl style={{marginBottom:12}}>Clics affiliés — 7 jours</Lbl>
        <MiniBar data={[40,80,60,120,95,150,130]}/>
      </Card>
      <Lbl style={{marginBottom:10}}>Top produits</Lbl>
      {PRODUCTS_DATA.slice(0,3).map((p,i)=>(
        <Card key={p.id} style={{marginBottom:8}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div><div style={{fontSize:13,fontWeight:600,color:t.primary}}>{p.name}</div><div style={{fontSize:11,color:t.sec}}>{[48,32,19][i]} ventes</div></div>
            <div style={{fontSize:14,fontWeight:700,color:t.primary}}>${[1680,1472,702][i]}</div></div>
        </Card>
      ))}</div>);
}

function MerchantWithdrawalsTab() {
  const {dark}=useTheme(); const t=Tk(dark);
  const [tab,setTab]=useState("pending");
  const [detailCreator,setDetailCreator]=useState(null);
  const [requests,setRequests]=useState(SharedDB.getWithdrawals());
  const [codes,setCodes]=useState({});
  const refresh=()=>setRequests([...SharedDB.getWithdrawals()]);

  const approveWithCode=(id)=>{
    const code=genCode();
    setCodes(p=>({...p,[id]:code}));
    SharedDB.approveWithdrawal(id,code);
    refresh();
  };
  const reject=(id)=>{SharedDB.rejectWithdrawal(id);refresh();};

  // Group by creator
  const creatorMap={};
  requests.forEach(r=>{
    if(!creatorMap[r.customerId]) creatorMap[r.customerId]={
      id:r.customerId, name:r.customerName||"Créateur",
      requests:[], totalDue:0, totalPaid:0,
    };
    creatorMap[r.customerId].requests.push(r);
    if(r.status==="completed") creatorMap[r.customerId].totalPaid+=(r.currency==="CDF"?r.amount/USD_TO_CDF:r.amount);
    else if(r.status!=="rejected") creatorMap[r.customerId].totalDue+=(r.currency==="CDF"?r.amount/USD_TO_CDF:r.amount);
  });
  const creators=Object.values(creatorMap);

  const pending   = requests.filter(r=>r.status==="pending");
  const approved  = requests.filter(r=>r.status==="approved");
  const history   = requests.filter(r=>r.status==="completed"||r.status==="rejected");
  const totalDueAll = creators.reduce((s,cr)=>s+cr.totalDue,0);

  const fmtAmt=(v,cur)=>cur==="CDF"?`${Math.round(v).toLocaleString()} CDF`:`$${parseFloat(v).toFixed(2)}`;

  // Creator detail view
  if(detailCreator){
    const cr=creatorMap[detailCreator];
    if(!cr) return null;
    const crReqs=cr.requests;
    // Get commissions from SharedOrdersDB for this creator
    const crOrders=SharedOrdersDB.getByCreator(detailCreator).filter(o=>o.merchantId==="mrc_jordan"&&o.status==="validated");
    const totalGenerated=crOrders.reduce((s,o)=>s+(o.currency==="CDF"?o.price*o.commission/100/USD_TO_CDF:o.price*o.commission/100),0);
    const totalWithdrawn=crReqs.filter(r=>r.status==="completed").reduce((s,r)=>s+(r.currency==="CDF"?r.amount/USD_TO_CDF:r.amount),0);
    const available=totalGenerated-totalWithdrawn;
    return (
      <div style={{padding:"20px 16px 100px"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
          <button onClick={()=>setDetailCreator(null)} style={{background:"none",border:"none",cursor:"pointer"}}><Ico n="arL" size={20}/></button>
          <div><Lbl style={{marginBottom:3}}>CRÉATEUR</Lbl><H size={18}>{cr.name}</H></div>
        </div>
        {/* Balance */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:16}}>
          {[["Total généré",`$${totalGenerated.toFixed(2)}`,t.primary],["Déjà retiré",`$${totalWithdrawn.toFixed(2)}`,t.sec],["Disponible",`$${Math.max(0,available).toFixed(2)}`,t.green]].map(([l,v,col])=>(
            <Card key={l} style={{textAlign:"center",padding:"12px 8px"}}>
              <div style={{fontSize:16,fontWeight:800,color:col}}>{v}</div>
              <Lbl style={{marginTop:3}}>{l}</Lbl>
            </Card>
          ))}
        </div>
        {/* Commissions générées */}
        {crOrders.length>0&&(
          <>
            <Lbl style={{marginBottom:10}}>Ventes générées via ses liens</Lbl>
            {crOrders.map((o,i)=>(
              <div key={o.id} style={{background:t.card,border:`0.5px solid ${t.line}`,borderRadius:14,padding:"12px 14px",marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{fontSize:13,fontWeight:600,color:t.primary}}>{o.productName}</div>
                    <div style={{fontSize:10,color:t.sec,marginTop:1}}>{o.date} · Commission {o.commission}%</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:13,fontWeight:700,color:t.green}}>+{fmtAmt(o.price*o.commission/100,o.currency)}</div>
                    <div style={{fontSize:10,color:t.tert}}>{fmtAmt(o.price,o.currency)}</div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
        {crOrders.length===0&&(
          <div style={{background:t.card2,borderRadius:12,padding:"14px",textAlign:"center",marginBottom:14}}>
            <div style={{fontSize:12,color:t.sec}}>Aucune vente validée via ce créateur pour l'instant.</div>
          </div>
        )}
        {/* Demandes de retrait */}
        {crReqs.filter(r=>r.status==="pending"||r.status==="approved").map(r=>(
          <div key={r.id} style={{background:t.card,border:`0.5px solid ${r.status==="approved"?t.gM:t.amber+"40"}`,borderRadius:14,padding:"13px 16px",marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
              <div>
                <div style={{fontSize:13,fontWeight:600,color:t.primary}}>{fmtAmt(r.amount,r.currency)}</div>
                <div style={{fontSize:11,color:t.sec,marginTop:1}}>{r.method==="cash"?"Espèces":"Mobile Money"}{r.provider?` · ${r.provider}`:""} · {r.date}</div>
              </div>
              <Chip label={r.status==="approved"?"Code envoyé":"En attente"} color={r.status==="approved"?"green":"amber"}/>
            </div>
            {codes[r.id]&&(
              <div style={{background:t.card2,borderRadius:10,padding:"10px",textAlign:"center",marginBottom:8}}>
                <div style={{fontSize:10,color:t.sec,marginBottom:4}}>Code de validation</div>
                <div style={{fontSize:24,fontWeight:800,letterSpacing:5,fontFamily:"monospace",color:t.green}}>{codes[r.id]}</div>
              </div>
            )}
            {r.status==="pending"&&available>=r.amount&&(
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>reject(r.id)} style={{flex:1,padding:"10px 0",borderRadius:12,border:`0.5px solid ${t.red}40`,background:t.rL,color:t.red,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:F}}>Rejeter</button>
                <button onClick={()=>approveWithCode(r.id)} style={{flex:2,padding:"10px 0",borderRadius:12,border:"none",background:t.green,color:"#000",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:F}}>Approuver + Générer code</button>
              </div>
            )}
            {r.status==="pending"&&available<r.amount&&(
              <div style={{background:t.rL,borderRadius:10,padding:"8px 12px",textAlign:"center",fontSize:11,color:t.red}}>Balance insuffisante — impossible d'approuver</div>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{padding:"20px 16px 100px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div><Lbl style={{marginBottom:4}}>RETRAITS</Lbl><H size={22}>Gestion</H></div>
        <ThemeToggle/>
      </div>

      {/* Total dû */}
      <div style={{background:t.card,border:`0.5px solid ${t.line}`,borderRadius:18,padding:"16px 18px",marginBottom:14,boxShadow:t.shadow}}>
        <Lbl style={{marginBottom:6}}>Total dû aux créateurs</Lbl>
        <div style={{fontSize:32,fontWeight:800,color:t.primary,letterSpacing:-1}}>~${totalDueAll.toFixed(2)}</div>
        <div style={{fontSize:11,color:t.sec,marginTop:4}}>{creators.length} créateur{creators.length>1?"s":""} avec solde actif</div>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",background:t.card2,borderRadius:12,padding:3,marginBottom:16,gap:3}}>
        {[["pending","En attente",pending.length+approved.length],["history","Historique",history.length],["creators","Par créateur",creators.length]].map(([id,lb,count])=>(
          <button key={id} onClick={()=>setTab(id)}
            style={{flex:1,padding:"8px 4px",borderRadius:10,border:"none",background:tab===id?t.primary:"transparent",color:tab===id?t.inv:t.sec,fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:F}}>
            {lb} {count>0&&`(${count})`}
          </button>
        ))}
      </div>

      {/* En attente */}
      {tab==="pending"&&(
        <>
          {[...approved,...pending].length===0&&<div style={{textAlign:"center",padding:"30px 0",color:t.tert,fontSize:12}}>Aucune demande en attente.</div>}
          {approved.map(r=>(
            <div key={r.id} style={{background:t.card,border:`0.5px solid ${t.gM}`,borderRadius:16,padding:"14px 16px",marginBottom:10,boxShadow:t.shadow}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                <div>
                  <div style={{fontSize:14,fontWeight:700,color:t.primary}}>{r.customerName}</div>
                  <div style={{fontSize:11,color:t.sec,marginTop:2}}>{r.method==="cash"?"Espèces":"Mobile Money"}{r.provider?` · ${r.provider}`:""} · {r.date}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:16,fontWeight:800,color:t.primary}}>{fmtAmt(r.amount,r.currency)}</div>
                  <Chip label="Code envoyé" color="green"/>
                </div>
              </div>
              {codes[r.id]&&(
                <div style={{background:t.card2,borderRadius:10,padding:"8px 12px",textAlign:"center",fontFamily:"monospace",fontSize:20,fontWeight:700,letterSpacing:4,color:t.green}}>{codes[r.id]}</div>
              )}
            </div>
          ))}
          {pending.map(r=>(
            <div key={r.id} style={{background:t.card,border:`0.5px solid ${t.amber}40`,borderRadius:16,padding:"14px 16px",marginBottom:10,boxShadow:t.shadow}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                <div>
                  <div style={{fontSize:14,fontWeight:700,color:t.primary}}>{r.customerName}</div>
                  <div style={{fontSize:11,color:t.sec,marginTop:2}}>{r.method==="cash"?"Espèces":"Mobile Money"}{r.provider?` · ${r.provider}`:""}{r.number?` · ${r.number}`:""} · {r.date}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:16,fontWeight:800,color:t.primary}}>{fmtAmt(r.amount,r.currency)}</div>
                  <Chip label="En attente" color="amber"/>
                </div>
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>reject(r.id)} style={{flex:1,padding:"10px 0",borderRadius:12,border:`0.5px solid ${t.red}40`,background:t.rL,color:t.red,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:F}}>Rejeter</button>
                <button onClick={()=>approveWithCode(r.id)} style={{flex:2,padding:"10px 0",borderRadius:12,border:"none",background:t.primary,color:t.inv,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:F}}>Approuver + Code</button>
              </div>
            </div>
          ))}
        </>
      )}

      {/* Historique */}
      {tab==="history"&&(
        history.length===0
          ? <div style={{textAlign:"center",padding:"30px 0",color:t.tert,fontSize:12}}>Aucun retrait traité.</div>
          : history.map(r=>(
            <div key={r.id} style={{background:t.card,border:`0.5px solid ${r.status==="completed"?t.gM:t.line}`,borderRadius:14,padding:"13px 16px",marginBottom:8,boxShadow:t.shadow}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:t.primary}}>{r.customerName}</div>
                  <div style={{fontSize:10,color:t.sec,marginTop:1}}>{r.date} · {r.method==="cash"?"Espèces":"Mobile Money"}</div>
                  {r.status==="completed"&&r.code&&<div style={{fontSize:10,fontFamily:"monospace",color:t.tert,marginTop:2}}>Code utilisé : {r.code}</div>}
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:14,fontWeight:700,color:r.status==="completed"?t.green:t.red}}>{fmtAmt(r.amount,r.currency)}</div>
                  <Chip label={r.status==="completed"?"Complété":"Rejeté"} color={r.status==="completed"?"green":"red"}/>
                </div>
              </div>
            </div>
          ))
      )}

      {/* Par créateur */}
      {tab==="creators"&&(
        creators.length===0
          ? <div style={{textAlign:"center",padding:"30px 0",color:t.tert,fontSize:12}}>Aucun créateur avec solde.</div>
          : creators.map(cr=>(
            <div key={cr.id} onClick={()=>setDetailCreator(cr.id)}
              style={{background:t.card,border:`0.5px solid ${t.line}`,borderRadius:16,padding:"14px 16px",marginBottom:10,cursor:"pointer",boxShadow:t.shadow}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <div style={{width:40,height:40,borderRadius:"50%",background:t.card2,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <span style={{fontSize:13,fontWeight:700,color:t.sec}}>{cr.name[0]}</span>
                  </div>
                  <div>
                    <div style={{fontSize:14,fontWeight:600,color:t.primary}}>{cr.name}</div>
                    <div style={{fontSize:11,color:t.sec,marginTop:1}}>{cr.requests.length} demande{cr.requests.length>1?"s":""}</div>
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:15,fontWeight:700,color:cr.totalDue>0?t.amber:t.sec}}>${cr.totalDue.toFixed(2)}</div>
                    <div style={{fontSize:10,color:t.tert}}>en attente</div>
                  </div>
                  <Ico n="arR" size={15} color={t.tert}/>
                </div>
              </div>
            </div>
          ))
      )}
    </div>
  );
}

function MerchantProfileTab({ onLogout }) {
  const {dark}=useTheme(); const t=Tk(dark);
  const {profile}=useAuth();
  const [section,setSection]=useState(null);

  if(section==="settings") return <MerchantSettings onBack={()=>setSection(null)}/>;
  if(section==="notifications") return <MerchantNotifications onBack={()=>setSection(null)}/>;
  if(section==="security") return <MerchantSecurity onBack={()=>setSection(null)} onLogout={onLogout}/>;

  return (
    <div style={{padding:"20px 16px 100px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div><Lbl style={{marginBottom:4}}>MA BOUTIQUE</Lbl><H size={22}>Jordan Store</H></div>
        <ThemeToggle/>
      </div>

      <Card style={{marginBottom:16,textAlign:"center"}}>
        <div style={{width:68,height:68,borderRadius:18,background:t.card2,border:`0.5px solid ${t.line2}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"}}>
          <Ico n="store" size={28} color={t.sec}/>
        </div>
        <H size={17}>Jordan Store</H>
        <div style={{fontSize:12,color:t.sec,marginTop:3}}>{profile?.email}</div>
        <div style={{fontSize:11,color:t.tert,marginTop:2,fontFamily:"monospace"}}>swiin.app/store/jordan-store</div>
        <div style={{marginTop:10,display:"flex",justifyContent:"center",gap:6}}>
          <Chip label="Retail" color="purple"/>
          <Chip label="Vérifié" color="green"/>
        </div>
      </Card>

      {[
        {id:"settings",     icon:"settings", label:"Paramètres boutique",  sub:"Logo, nom, description, adresse"},
        {id:"notifications",icon:"bell",     label:"Notifications",         sub:"Gérer vos alertes"},
        {id:"security",     icon:"shield",   label:"Sécurité",              sub:"Mot de passe, OTP, déconnexion"},
      ].map(item=>(
        <div key={item.id} onClick={()=>setSection(item.id)}
          style={{background:t.card,border:`0.5px solid ${t.line}`,borderRadius:14,padding:"13px 16px",marginBottom:8,cursor:"pointer",boxShadow:t.shadow,display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:38,height:38,borderRadius:12,background:t.card2,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <Ico n={item.icon} size={17} color={t.sec}/>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:600,color:t.primary}}>{item.label}</div>
            <div style={{fontSize:11,color:t.sec,marginTop:1}}>{item.sub}</div>
          </div>
          <Ico n="arR" size={15} color={t.tert}/>
        </div>
      ))}
      <Btn v="danger" icon="logout" style={{marginTop:16}} onClick={onLogout}>Se déconnecter</Btn>
    </div>
  );
}

function MerchantSettings({ onBack }) {
  const {dark}=useTheme(); const t=Tk(dark);
  const [form,setForm]=useState({name:"Jordan Store",type:"retail",desc:"Sneakers & mode urbaine premium. Nike, Jordan, Adidas.",address:"Av. Colonel Ebeya",city:"Kinshasa"});
  const set=k=>e=>setForm(f=>({...f,[k]:e.target.value}));
  const [saved,setSaved]=useState(false);
  return (
    <div style={{padding:"20px 16px 100px"}}>
      <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:6,marginBottom:20,padding:0}}>
        <Ico n="arL" size={16} color={t.sec}/><span style={{fontSize:12,color:t.sec}}>Boutique</span>
      </button>
      <Lbl style={{marginBottom:4}}>PARAMÈTRES</Lbl><H size={22} style={{marginBottom:20}}>Ma boutique</H>

      {saved&&<SuccessBanner message="Modifications enregistrées avec succès !"/>}

      {/* Logo */}
      <Lbl style={{marginBottom:8}}>Logo de la boutique</Lbl>
      <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:18}}>
        <div style={{width:68,height:68,borderRadius:16,background:t.card2,border:`0.5px solid ${t.line2}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <Ico n="store" size={28} color={t.sec}/>
        </div>
        <div>
          <button style={{background:t.primary,color:t.inv,border:"none",borderRadius:10,padding:"8px 16px",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:F,marginBottom:6,display:"block"}}>
            Changer le logo
          </button>
          <div style={{fontSize:10,color:t.tert}}>JPG, PNG · Max 2MB</div>
        </div>
      </div>

      {[["Nom de la boutique","name","text","Jordan Store"],["Description","desc","text","Décrivez votre commerce..."],["Adresse","address","text","Av. Colonel Ebeya"],["Ville","city","text","Kinshasa"]].map(([l,f,tp,ph])=>(
        <div key={f} style={{marginBottom:12}}>
          <Lbl style={{marginBottom:5}}>{l}</Lbl>
          <input type={tp} value={form[f]||""} onChange={set(f)} placeholder={ph}
            style={{width:"100%",background:t.card2,border:`0.5px solid ${t.line2}`,borderRadius:12,padding:"12px 14px",color:t.primary,fontSize:13,fontFamily:F,outline:"none",boxSizing:"border-box"}}/>
        </div>
      ))}

      <Lbl style={{marginBottom:8}}>Type de commerce</Lbl>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:16}}>
        {[["retail","Boutique"],["restaurant","Restaurant"],["barber","Barbershop"],["salon","Salon"],["cafe","Café"],["spa","Spa"],["hotel","Hôtel"],["service","Service"]].map(([id,label])=>(
          <button key={id} onClick={()=>setForm(f=>({...f,type:id}))}
            style={{padding:"9px 0",borderRadius:10,border:`0.5px solid ${form.type===id?t.primary:t.line}`,background:form.type===id?t.primary:"transparent",color:form.type===id?t.inv:t.sec,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:F}}>
            {label}
          </button>
        ))}
      </div>

      <Btn onClick={()=>{setSaved(true);setTimeout(()=>setSaved(false),3000);}}>Enregistrer les modifications</Btn>
    </div>
  );
}

function MerchantNotifications({ onBack }) {
  const {dark}=useTheme(); const t=Tk(dark);
  const [notifs,setNotifs]=useState({newOrder:true,newWithdrawal:true,newAffiliate:true,orderReminder:false});
  const toggle=k=>setNotifs(n=>({...n,[k]:!n[k]}));
  const items=[
    {key:"newOrder",      label:"Nouvelle commande créateur",   sub:"Quand un créateur soumet une demande de validation"},
    {key:"newWithdrawal", label:"Nouvelle demande de retrait",  sub:"Quand un créateur demande un retrait"},
    {key:"newAffiliate",  label:"Nouveau créateur affilié",     sub:"Quand un créateur achète votre produit"},
    {key:"orderReminder", label:"Rappel commandes en attente",  sub:"Rappel quotidien si commandes non traitées"},
  ];
  return (
    <div style={{padding:"20px 16px 100px"}}>
      <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:6,marginBottom:20,padding:0}}>
        <Ico n="arL" size={16} color={t.sec}/><span style={{fontSize:12,color:t.sec}}>Boutique</span>
      </button>
      <Lbl style={{marginBottom:4}}>NOTIFICATIONS</Lbl><H size={22} style={{marginBottom:20}}>Alertes</H>
      {items.map(item=>(
        <div key={item.key} style={{background:t.card,border:`0.5px solid ${t.line}`,borderRadius:14,padding:"13px 16px",marginBottom:8,display:"flex",alignItems:"center",gap:12,boxShadow:t.shadow}}>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:600,color:t.primary}}>{item.label}</div>
            <div style={{fontSize:11,color:t.sec,marginTop:1}}>{item.sub}</div>
          </div>
          <div onClick={()=>toggle(item.key)}
            style={{width:44,height:26,borderRadius:13,background:notifs[item.key]?t.green:t.card2,border:`0.5px solid ${notifs[item.key]?t.green:t.line2}`,cursor:"pointer",position:"relative",transition:"all 0.2s",flexShrink:0}}>
            <div style={{position:"absolute",top:3,left:notifs[item.key]?20:3,width:20,height:20,borderRadius:"50%",background:notifs[item.key]?"#000":t.sec,transition:"left 0.2s"}}/>
          </div>
        </div>
      ))}
    </div>
  );
}

function MerchantSecurity({ onBack, onLogout }) {
  const {dark}=useTheme(); const t=Tk(dark);
  const [view,setView]=useState("menu");
  const [form,setForm]=useState({old:"",newP:"",confirm:""});
  const [errors,setErrors]=useState({});
  const [success,setSuccess]=useState(false);
  const set=k=>e=>{setErrors({});setForm(f=>({...f,[k]:e.target.value}));};

  const handleChangePwd=()=>{
    const e={};
    if(!form.old) e.old="Requis";
    if(form.newP.length<6) e.newP="Au moins 6 caractères";
    if(form.newP!==form.confirm) e.confirm="Ne correspondent pas";
    setErrors(e); if(Object.keys(e).length>0) return;
    setSuccess(true); setTimeout(()=>{setSuccess(false);setView("menu");},2000);
  };

  if(view==="password") return (
    <div style={{padding:"20px 16px 100px"}}>
      <button onClick={()=>setView("menu")} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:6,marginBottom:20,padding:0}}>
        <Ico n="arL" size={16} color={t.sec}/><span style={{fontSize:12,color:t.sec}}>Sécurité</span>
      </button>
      <H size={22} style={{marginBottom:20}}>Mot de passe</H>
      {success&&<SuccessBanner message="Mot de passe modifié avec succès !"/>}
      <TextInput label="Mot de passe actuel" icon="lock" type="password" value={form.old} onChange={set("old")} placeholder="••••••••" error={errors.old}/>
      <TextInput label="Nouveau mot de passe" icon="lock" type="password" value={form.newP} onChange={set("newP")} placeholder="Au moins 6 caractères" error={errors.newP}/>
      <TextInput label="Confirmer" icon="lock" type="password" value={form.confirm} onChange={set("confirm")} placeholder="Répétez" error={errors.confirm}/>
      <Btn onClick={handleChangePwd}>Modifier le mot de passe</Btn>
    </div>
  );

  return (
    <div style={{padding:"20px 16px 100px"}}>
      <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:6,marginBottom:20,padding:0}}>
        <Ico n="arL" size={16} color={t.sec}/><span style={{fontSize:12,color:t.sec}}>Boutique</span>
      </button>
      <Lbl style={{marginBottom:4}}>SÉCURITÉ</Lbl><H size={22} style={{marginBottom:20}}>Sécurité</H>
      {[
        {icon:"lock",  label:"Modifier le mot de passe",        sub:"Changez votre mot de passe",         action:()=>setView("password")},
        {icon:"phone", label:"Vérification téléphone",           sub:"Numéro vérifié ✓",                   action:()=>{}},
        {icon:"logout",label:"Déconnecter tous les appareils",   sub:"Session actuelle et autres",          action:onLogout},
      ].map(item=>(
        <div key={item.label} onClick={item.action}
          style={{background:t.card,border:`0.5px solid ${item.icon==="logout"?t.red+"30":t.line}`,borderRadius:14,padding:"13px 16px",marginBottom:8,cursor:"pointer",boxShadow:t.shadow,display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:38,height:38,borderRadius:12,background:item.icon==="logout"?t.rL:t.card2,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <Ico n={item.icon} size={17} color={item.icon==="logout"?t.red:t.sec}/>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:600,color:item.icon==="logout"?t.red:t.primary}}>{item.label}</div>
            <div style={{fontSize:11,color:t.sec,marginTop:1}}>{item.sub}</div>
          </div>
          <Ico n="arR" size={15} color={t.tert}/>
        </div>
      ))}
    </div>
  );
}

function AdminOverviewTab() {
  const {dark}=useTheme(); const t=Tk(dark);
  return (
    <div style={{padding:"20px 16px 100px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
        <div><Lbl style={{color:t.red,marginBottom:4}}>ADMINISTRATION</Lbl><H size={22}>Panel SWIIN</H></div>
        <div style={{display:"flex",gap:8}}><Chip label="Admin" color="red"/><ThemeToggle/></div></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
        <StatCard label="Revenus SWIIN" value="$6 200" color={t.green}/>
        <StatCard label="Frais collectés" value="$624"/>
        <StatCard label="Dettes actives" value="$89.40" color={t.amber}/>
        <StatCard label="Comptes verrouillés" value="4" color={t.red}/></div>
      <Card style={{marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}><Lbl>Volume plateforme — 7j</Lbl></div>
        <MiniBar data={[2400,4800,3600,8400,7200,12000,10800]}/>
      </Card>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
        <Card style={{textAlign:"center"}}><Lbl>Frais en attente</Lbl><div style={{fontSize:30,fontWeight:800,color:t.amber,marginTop:6}}>2</div></Card>
        <Card style={{textAlign:"center"}}><Lbl>Alertes fraude</Lbl><div style={{fontSize:30,fontWeight:800,color:t.red,marginTop:6}}>1</div></Card>
      </div>
      <Lbl style={{marginBottom:10}}>Activité récente</Lbl>
      {[{icon:"percent",t:"Frais reçus — Freddy M.",sub:"$12.40 via M-Pesa",time:"1h"},{icon:"lock",t:"Lien verrouillé",sub:"Amina B. — frais impayés",time:"2h"},{icon:"check",t:"Marchand vérifié",sub:"Jordan Store",time:"3h"},{icon:"alert",t:"Alerte fraude détectée",sub:"5 tentatives simultanées",time:"5h"}].map((a,i)=>(
        <Card key={i} style={{marginBottom:8}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:36,height:36,borderRadius:12,background:t.card2,border:`0.5px solid ${t.line}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Ico n={a.icon} size={15} color={t.sec}/></div>
            <div style={{flex:1}}><div style={{fontSize:13,fontWeight:500,color:t.primary}}>{a.t}</div><div style={{fontSize:11,color:t.sec,marginTop:1}}>{a.sub}</div></div>
            <div style={{fontSize:10,color:t.tert}}>{a.time}</div></div>
        </Card>
      ))}</div>);
}

function AdminUsersTab() {
  const {dark}=useTheme(); const t=Tk(dark);
  return (
    <div style={{padding:"20px 16px 100px"}}>
      <PageHeader title="Utilisateurs" right={<ThemeToggle/>}/>
      <Card style={{marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between"}}>
          {[["Total","1 284"],["Actifs","1 248"],["Verrouillés","36"]].map(([l,v])=>(
            <div key={l} style={{textAlign:"center",flex:1}}>
              <div style={{fontSize:22,fontWeight:700,color:t.primary}}>{v}</div>
              <Lbl style={{marginTop:3}}>{l}</Lbl></div>
          ))}</div>
      </Card>
      {ADMIN_USERS_DATA.map((u,i)=>(
        <Card key={i} style={{marginBottom:8}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:36,height:36,borderRadius:"50%",background:t.card2,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:12,fontWeight:700,color:t.sec}}>{u.name[0]}</span></div>
              <div><div style={{fontSize:13,fontWeight:600,color:t.primary}}>{u.name}</div><div style={{fontSize:10,color:t.sec}}>{u.email}</div></div>
            </div>
            <Chip label={STATUS_CFG[u.status]?.label||u.status} color={STATUS_CFG[u.status]?.color||"green"}/></div>
          <Div m="0 0 8px"/>
          <div style={{display:"flex",justifyContent:"space-between"}}>
            <div style={{fontSize:11,color:t.sec}}>Gagné : <span style={{color:t.primary,fontWeight:600}}>{u.earned}</span></div>
            <div style={{fontSize:11,color:t.sec}}>Frais : <span style={{color:t.amber,fontWeight:600}}>{u.fees}</span></div>
            <div style={{fontSize:11,color:t.sec}}>Inscrit : {u.joined}</div></div>
        </Card>
      ))}</div>);
}

function AdminMerchantsTab() {
  const {dark}=useTheme(); const t=Tk(dark);
  const [merchants,setMerchants]=useState(ADMIN_MERCHANTS_DATA);
  return (
    <div style={{padding:"20px 16px 100px"}}>
      <PageHeader title="Marchands" right={<ThemeToggle/>}/>
      <div style={{display:"flex",gap:8,marginBottom:14}}>
        <Chip label={`${merchants.filter(m=>m.verified).length} vérifiés`} color="green"/>
        <Chip label={`${merchants.filter(m=>!m.verified).length} en attente`} color="amber"/></div>
      {merchants.map((m,i)=>(
        <Card key={i} style={{marginBottom:10}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:40,height:40,borderRadius:12,background:t.card2,display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="store" size={16} color={t.sec}/></div>
              <div><div style={{fontSize:13,fontWeight:600,color:t.primary}}>{m.name}</div><div style={{fontSize:10,color:t.sec}}>{m.type} · {m.affiliates} affiliés</div></div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:14,fontWeight:700,color:t.primary}}>{m.revenue}</div>
              <div style={{fontSize:10,color:t.amber}}>Frais : {m.fees}</div></div></div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <Chip label={m.verified?"Vérifié":"En attente"} color={m.verified?"green":"amber"}/>
            {!m.verified&&(
              <button onClick={()=>setMerchants(ms=>ms.map(x=>x.id===m.id?{...x,verified:true}:x))} style={{background:t.primary,color:t.inv,border:"none",borderRadius:10,padding:"6px 14px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:F}}>Vérifier</button>
            )}</div>
        </Card>
      ))}</div>);
}

function AdminFeesTab() {
  const {dark}=useTheme(); const t=Tk(dark);
  const [submissions,setSubmissions]=useState([...FeePaymentsDB.getAll()]);
  const [detail,setDetail]=useState(null);

  const approve=(id)=>{ FeePaymentsDB.validate(id); setSubmissions([...FeePaymentsDB.getAll()]); setDetail(null); };
  const reject=(id)=>{ FeePaymentsDB.reject(id,"Transaction non reconnue."); setSubmissions([...FeePaymentsDB.getAll()]); setDetail(null); };

  const NETWORK_LABELS={orange:"Orange Money",airtel:"Airtel Money",mpesa:"M-Pesa",africell:"Africell Money"};

  if(detail){
    const sub=submissions.find(s=>s.id===detail);
    return (
      <div style={{padding:"20px 16px 100px"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
          <button onClick={()=>setDetail(null)} style={{background:"none",border:"none",cursor:"pointer"}}><Ico n="arL" size={20}/></button>
          <div><Lbl style={{marginBottom:3}}>VÉRIFICATION PAIEMENT</Lbl><H size={18}>{sub.name}</H></div></div>
        <Card style={{marginBottom:14,border:`0.5px solid ${sub.status==="pending"?t.amber+"40":sub.status==="validated"?t.gM:t.line}`}}>
          {[["Créateur",sub.name],["Montant",`$${sub.amount?.toFixed(2)}`],["Réseau",NETWORK_LABELS[sub.network]||sub.network],["ID transaction",sub.txId],["Nom sur reçu",sub.txName],["Date paiement",sub.txDate],["Soumis le",sub.submittedAt]].map(([l,v])=>(
            <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:`0.5px solid ${t.line}`}}>
              <span style={{fontSize:12,color:t.sec}}>{l}</span>
              <span style={{fontSize:12,fontWeight:600,color:t.primary,fontFamily:l==="ID transaction"?"monospace":F}}>{v}</span>
            </div>
          ))}
          <div style={{display:"flex",justifyContent:"space-between",padding:"9px 0 0"}}>
            <span style={{fontSize:12,color:t.sec}}>Statut</span>
            <Chip label={sub.status==="pending"?"À valider":sub.status==="validated"?"Validé":"Rejeté"} color={sub.status==="pending"?"amber":sub.status==="validated"?"green":"red"}/>
          </div>
        </Card>
        {sub.status==="pending"&&(
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>reject(sub.id)} style={{flex:1,padding:"13px 0",borderRadius:14,border:`0.5px solid ${t.red}40`,background:t.rL,color:t.red,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:F}}>Rejeter</button>
            <button onClick={()=>approve(sub.id)} style={{flex:2,padding:"13px 0",borderRadius:14,border:"none",background:t.green,color:"#000",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:F}}>Valider → Débloquer liens</button>
          </div>
        )}
        {sub.status==="validated"&&(
          <div style={{background:t.gL,border:`0.5px solid ${t.gM}`,borderRadius:12,padding:"12px 14px",display:"flex",alignItems:"center",gap:8}}>
            <Ico n="unlock" size={14} color={t.green}/>
            <span style={{fontSize:12,color:t.green,fontWeight:600}}>Liens débloqués · Transaction validée</span>
          </div>
        )}
        {sub.status==="rejected"&&(
          <div style={{background:t.rL,border:`0.5px solid ${t.red}30`,borderRadius:12,padding:"12px 14px"}}>
            <div style={{fontSize:12,color:t.red}}>Transaction non reconnue. Le créateur doit resoumettre.</div></div>
        )}</div>);
  }

  const pending=submissions.filter(s=>s.status==="pending");
  const processed=submissions.filter(s=>s.status!=="pending");
  return (
    <div style={{padding:"20px 16px 100px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div><Lbl style={{marginBottom:4}}>FRAIS SWIIN</Lbl><H size={22}>Validations paiements</H></div>
        <ThemeToggle/></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:18}}>
        {[["À valider",pending.length,t.amber],["Validés",processed.filter(s=>s.status==="validated").length,t.green],["Rejetés",processed.filter(s=>s.status==="rejected").length,t.red],["Total soumis",submissions.length,t.primary]].map(([l,v,col])=>(
          <Card key={l}><Lbl style={{marginBottom:4}}>{l}</Lbl><div style={{fontSize:22,fontWeight:700,color:col,marginTop:2}}>{v}</div></Card>
        ))}</div>
      {pending.length>0&&<Lbl style={{marginBottom:10}}>En attente de validation</Lbl>}
      {pending.map(sub=>(
        <div key={sub.id} onClick={()=>setDetail(sub.id)}
          style={{background:t.card,border:`0.5px solid ${t.amber+"40"}`,borderRadius:16,padding:"14px 16px",marginBottom:10,cursor:"pointer",boxShadow:t.shadow}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
            <div>
              <div style={{fontSize:14,fontWeight:700,color:t.primary}}>{sub.name}</div>
              <div style={{fontSize:11,color:t.sec,marginTop:2}}>{NETWORK_LABELS[sub.network]||sub.network} · {sub.submittedAt}</div>
              <div style={{fontSize:10,fontFamily:"monospace",color:t.tert,marginTop:2}}>{sub.txId}</div></div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:18,fontWeight:800,color:t.amber}}>${sub.amount?.toFixed(2)}</div>
              <Chip label="À valider" color="amber"/></div></div>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <Ico n="arR" size={13} color={t.tert}/>
            <span style={{fontSize:11,color:t.tert}}>Cliquer pour vérifier</span></div></div>
      ))}
      {processed.length>0&&<Lbl style={{margin:"14px 0 10px"}}>Traités</Lbl>}
      {processed.map(sub=>(
        <div key={sub.id} onClick={()=>setDetail(sub.id)}
          style={{background:t.card,border:`0.5px solid ${t.line}`,borderRadius:14,padding:"12px 16px",marginBottom:8,cursor:"pointer",boxShadow:t.shadow}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:13,fontWeight:600,color:t.primary}}>{sub.name}</div>
              <div style={{fontSize:10,color:t.sec,marginTop:1}}>{sub.submittedAt}</div></div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:14,fontWeight:700,color:t.primary}}>${sub.amount?.toFixed(2)}</div>
              <Chip label={sub.status==="validated"?"Validé":"Rejeté"} color={sub.status==="validated"?"green":"red"}/>
            </div></div></div>
      ))}</div>);
}

function AdminVerifyTab() {
  const {dark}=useTheme(); const t=Tk(dark);
  const [merchants,setMerchants]=useState(
    Object.values(MockDB.merchants||{}).map(m=>({...m,verifyStatus:m.isVerified?"verified":m.status==="pending"?"pending_review":"pending_review"}))
  );
  const approve=(id)=>setMerchants(mm=>mm.map(m=>m.merchantId===id?{...m,isVerified:true,verifyStatus:"verified",status:"active"}:m));
  const reject=(id)=>setMerchants(mm=>mm.map(m=>m.merchantId===id?{...m,verifyStatus:"rejected",status:"rejected"}:m));

  const pending=merchants.filter(m=>m.verifyStatus==="pending_review");
  const verified=merchants.filter(m=>m.verifyStatus==="verified");

  return (
    <div style={{padding:"20px 16px 100px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div><Lbl style={{marginBottom:4}}>VÉRIFICATION</Lbl><H size={22}>Marchands</H></div>
        <ThemeToggle/></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:18}}>
        <Card><Lbl style={{marginBottom:4}}>En attente</Lbl><div style={{fontSize:22,fontWeight:700,color:t.amber,marginTop:2}}>{pending.length}</div></Card>
        <Card><Lbl style={{marginBottom:4}}>Vérifiés</Lbl><div style={{fontSize:22,fontWeight:700,color:t.green,marginTop:2}}>{verified.length}</div></Card>
      </div>
      {pending.length>0&&<Lbl style={{marginBottom:10}}>En attente de validation</Lbl>}
      {pending.map(m=>(
        <Card key={m.merchantId} style={{marginBottom:12,border:`0.5px solid ${t.amber+"40"}`}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:12}}>
            <div style={{width:44,height:44,borderRadius:12,background:t.card2,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <Ico n="store" size={20} color={t.sec}/></div>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:700,color:t.primary}}>{m.name}</div>
              <div style={{fontSize:11,color:t.sec,marginTop:2}}>{m.type} · {m.city||"Kinshasa"}</div>
              <div style={{fontSize:11,color:t.sec,marginTop:1}}>{m.email} · {m.phone}</div></div>
            <Chip label="En attente" color="amber"/></div>
          {m.description&&<div style={{fontSize:11,color:t.sec,marginBottom:12,background:t.card2,borderRadius:8,padding:"8px 10px"}}>{m.description}</div>}
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>reject(m.merchantId)} style={{flex:1,padding:"11px 0",borderRadius:12,border:`0.5px solid ${t.red}40`,background:t.rL,color:t.red,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:F}}>Refuser</button>
            <button onClick={()=>approve(m.merchantId)} style={{flex:2,padding:"11px 0",borderRadius:12,border:"none",background:t.green,color:"#000",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:F}}>Approuver ✓</button>
          </div>
        </Card>
      ))}
      {verified.length>0&&<Lbl style={{margin:"14px 0 10px"}}>Marchands vérifiés</Lbl>}
      {verified.slice(0,4).map(m=>(
        <Card key={m.merchantId} style={{marginBottom:8}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:13,fontWeight:600,color:t.primary}}>{m.name}</div>
              <div style={{fontSize:10,color:t.sec,marginTop:1}}>{m.type} · {m.email}</div></div>
            <Chip label="Vérifié" color="green"/></div>
        </Card>
      ))}</div>);
}

function AdminAlertsTab() {
  const {dark}=useTheme(); const t=Tk(dark);
  return (
    <div style={{padding:"20px 16px 100px"}}>
      <PageHeader title="Alertes" right={<ThemeToggle/>}/>
      {[
        {level:"red",icon:"alert",title:"Fraude détectée",desc:"5 tentatives de retrait simultanées — Compte #4821",time:"Il y a 1h"},
        {level:"amber",icon:"lock",title:"Compte suspendu auto",desc:"Amina B. — Frais SWIIN impayés depuis 7 jours",time:"Il y a 3h"},
        {level:"amber",icon:"percent",title:"Paiement frais rejeté",desc:"Dieumerci K. — preuve insuffisante",time:"Il y a 5h"},
        {level:"purple",icon:"zap",title:"Nouveau Super Merchant",desc:"Kalume Network — 6 marchands onboardés",time:"Hier"},
      ].map((a,i)=>(
        <Card key={i} style={{marginBottom:10}}>
          <div style={{display:"flex",gap:12}}>
            <div style={{width:36,height:36,borderRadius:12,background:t.card2,border:`0.5px solid ${t.line}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Ico n={a.icon} size={15} color={t.sec}/></div>
            <div style={{flex:1}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                <div style={{fontSize:13,fontWeight:600,color:t.primary}}>{a.title}</div>
                <Chip label={a.level==="red"?"Critique":a.level==="amber"?"Attention":"Info"} color={a.level==="purple"?"purple":a.level}/>
              </div>
              <div style={{fontSize:11,color:t.sec,lineHeight:1.6}}>{a.desc}</div>
              <div style={{fontSize:10,color:t.tert,marginTop:5}}>{a.time}</div></div></div>
        </Card>
      ))}</div>);
}
function CustomerExplore({ onMerchant }) {
  const {dark}=useTheme(); const t=Tk(dark);
  const [cat,setCat]=useState("all");
  const [search,setSearch]=useState("");
  const [qrOpen,setQrOpen]=useState(false);
  const [scanned,setScanned]=useState(null);

  const CATS=[
    {id:"all",     label:"Tous"},
    {id:"retail",  label:"Boutiques"},
    {id:"barber",  label:"Barbers"},
    {id:"restaurant",label:"Restos"},
    {id:"salon",   label:"Salons"},
    {id:"cafe",    label:"Cafes"},
    {id:"spa",     label:"Spas"},
    {id:"hotel",   label:"Hotels"},
  ];

  const filtered = MERCHANTS_CATALOG.filter(m=>{
    const matchCat = cat==="all" || m.type===cat;
    const matchSearch = !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.city.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });
  const handleQrScan = () => {
    const m = MERCHANTS_CATALOG[Math.floor(Math.random()*MERCHANTS_CATALOG.length)];
    setScanned(m);
    setQrOpen(false);
    onMerchant(m);
  };

  return (
    <div style={{padding:"20px 16px 100px"}}>
      {}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <div><Lbl style={{marginBottom:4}}>EXPLORER</Lbl><H size={22}>Commerces</H></div>
        <button onClick={()=>setQrOpen(true)} style={{display:"flex",alignItems:"center",gap:6,background:t.card2,border:`0.5px solid ${t.line2}`,borderRadius:12,padding:"8px 12px",cursor:"pointer",fontFamily:F}}>
          <Ico n="qr" size={16} color={t.primary}/>
          <span style={{fontSize:12,fontWeight:600,color:t.primary}}>Scanner QR</span></button></div>

      {}
      <div style={{display:"flex",alignItems:"center",gap:10,background:t.card2,border:`0.5px solid ${t.line}`,borderRadius:14,padding:"11px 14px",marginBottom:14}}>
        <Ico n="search" size={16} color={t.sec}/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher un commerce, une ville..."
          style={{flex:1,background:"transparent",border:"none",outline:"none",color:t.primary,fontSize:14,fontFamily:F}}/>
        {search&&<button onClick={()=>setSearch("")} style={{background:"none",border:"none",color:t.sec,cursor:"pointer",fontSize:16,lineHeight:1}}>×</button>}
      </div>

      {}
      <div style={{display:"flex",gap:6,marginBottom:18,overflowX:"auto",paddingBottom:4,scrollbarWidth:"none"}}>
        {CATS.map(c=>(
          <button key={c.id} onClick={()=>setCat(c.id)} style={{padding:"7px 14px",borderRadius:20,border:`0.5px solid ${cat===c.id?t.primary:t.line}`,background:cat===c.id?t.primary:"transparent",color:cat===c.id?t.inv:t.sec,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:F,whiteSpace:"nowrap",flexShrink:0}}>
            {c.label}</button>
        ))}</div>

      {}
      {qrOpen&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:200,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
          <div style={{background:t.card,borderRadius:24,padding:28,width:"100%",maxWidth:340,textAlign:"center"}}>
            <Lbl style={{marginBottom:8,textAlign:"center"}}>SCANNER QR CODE</Lbl>
            <H size={18} style={{marginBottom:4}}>Scanner la boutique</H>
            <div style={{fontSize:12,color:t.sec,marginBottom:24,lineHeight:1.6}}>Scannez le QR code d'un marchand SWIIN pour acceder directement a sa boutique et ses produits.</div>
            {}
            <div style={{width:180,height:180,margin:"0 auto 20px",border:`2px solid ${t.green}`,borderRadius:16,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",background:t.card2}}>
              {}
              {[[0,0],[0,1],[1,0],[1,1]].map(([r,c],i)=>(
                <div key={i} style={{position:"absolute",[r?"bottom":"top"]:8,[c?"right":"left"]:8,width:24,height:24,borderTop:r?"none":`2px solid ${t.green}`,borderBottom:r?`2px solid ${t.green}`:"none",borderLeft:c?"none":`2px solid ${t.green}`,borderRight:c?`2px solid ${t.green}`:"none"}}/>
              ))}
              <div style={{textAlign:"center"}}>
                <Ico n="qr" size={40} color={t.sec}/>
                <div style={{fontSize:10,color:t.tert,marginTop:8}}>Pointez vers le QR</div></div></div>
            <button onClick={handleQrScan} style={{width:"100%",padding:"14px 0",borderRadius:14,border:"none",background:t.green,color:"#000",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:F,marginBottom:10}}>
              Simuler un scan</button>
            <button onClick={()=>setQrOpen(false)} style={{width:"100%",padding:"12px 0",borderRadius:14,border:`0.5px solid ${t.line2}`,background:"transparent",color:t.sec,fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:F}}>
              Annuler</button></div></div>
      )}

      {}
      <div style={{fontSize:11,color:t.sec,marginBottom:12}}>{filtered.length} commerce{filtered.length>1?"s":""} trouvé{filtered.length>1?"s":""}</div>

      {}
      {filtered.length===0&&(
        <div style={{textAlign:"center",padding:"40px 0"}}>
          <Ico n="search" size={32} color={t.tert}/>
          <div style={{fontSize:13,color:t.sec,marginTop:12}}>Aucun commerce trouvé</div></div>
      )}
      {filtered.map(m=>{
        const meta = TYPE_META[m.type]||{label:m.type,icon:"store",color:"green"};
        return (
          <div key={m.id} onClick={()=>onMerchant(m)}
            style={{background:t.card,border:`0.5px solid ${t.line}`,borderRadius:18,padding:"15px 16px",marginBottom:10,cursor:"pointer",boxShadow:t.shadow}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:14}}>
              {}
              <div style={{width:52,height:52,borderRadius:14,background:t.card2,border:`0.5px solid ${t.line2}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <Ico n={meta.icon} size={24} color={t.sec}/></div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:3}}>
                  <div style={{fontSize:14,fontWeight:700,color:t.primary,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.name}</div>
                  {m.verified&&<Ico n="check" size={14} color={t.green} sw={2.5}/>}</div>
                <div style={{fontSize:11,color:t.sec,marginBottom:6,lineHeight:1.4}}>{m.desc}</div>
                <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                  <Chip label={meta.label} color={meta.color}/>
                  <div style={{display:"flex",alignItems:"center",gap:3}}>
                    <Ico n="star" size={11} color={t.amber}/>
                    <span style={{fontSize:10,color:t.amber,fontWeight:600}}>{m.rating}</span>
                    <span style={{fontSize:10,color:t.tert}}>({m.ratingCount})</span></div>
                  <div style={{display:"flex",alignItems:"center",gap:3}}>
                    <Ico n="mappin" size={11} color={t.tert}/>
                    <span style={{fontSize:10,color:t.tert}}>{m.city}</span></div></div>
                <div style={{marginTop:8,display:"flex",gap:6,alignItems:"center"}}>
                  <span style={{fontSize:10,color:t.sec}}>{m.products.length} produit{m.products.length>1?"s":""}</span>
                  <span style={{fontSize:10,color:t.tert}}>·</span>
                  <span style={{fontSize:10,color:t.sec}}>{m.affiliates} affilié{m.affiliates>1?"s":""}</span></div>
              </div>
              <Ico n="arR" size={16} color={t.tert}/></div></div>);
      })}</div>);
}
function MerchantPublicPage({ merchant, onBack, purchasedIds, onPurchase }) {
  const {dark}=useTheme(); const t=Tk(dark);
  const [showQr,setShowQr]=useState(false);
  const [orders,setOrders]=useState({});
  const [showMore,setShowMore]=useState(false);
  const [tick,setTick]=useState(0); // force re-render to pick up merchant validations
  const meta = TYPE_META[merchant.type]||{label:merchant.type,icon:"store",color:"green"};

  // Check SharedOrdersDB for validated/rejected status (marchand side updates propagate here)
  const getOrderStatus = (prodId) => {
    if(orders[prodId]==="ordered") {
      // Check if marchand has since validated or rejected
      const liveOrder = SharedOrdersDB.getByCreator("usr_customer")
        .find(o=>o.merchantId===merchant.id&&o.productId===prodId);
      if(liveOrder?.status==="validated") return "validated";
      if(liveOrder?.status==="rejected")  return "rejected";
      return "ordered";
    }
    return orders[prodId] || null;
  };
  const handleOrder = (prod) => {
    // Write to SharedOrdersDB — visible chez le marchand instantanément
    const newOrder = {
      id: "ORD-" + Date.now(),
      creatorId: "usr_customer",
      creatorName: "Dieumerci K.",
      merchantId: merchant.id,
      merchantName: merchant.name,
      productId: prod.id,
      productName: prod.name,
      price: prod.price,
      currency: prod.currency||"USD",
      commission: prod.commission,
      status: "pending",
      date: "Maintenant",
      time: new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}),
    };
    SharedOrdersDB.add(newOrder);
    setOrders(o=>({...o,[prod.id]:"ordered"}));
    if(onPurchase) onPurchase(prod);
  };

  const handleGenerateLink = (prod) => {
    alert(`Lien généré !\nswiin.app/p/${prod.name.toLowerCase().replace(/\s+/g,"-")}?ref=dieumk\nCopiez ce lien et partagez-le.`);
  };

  const SHOWN = showMore ? merchant.products : merchant.products.slice(0,3);
  const hasMore = merchant.products.length > 3;

  return (
    <div style={{minHeight:"100%",background:t.bg}}>
      {}
      <div style={{height:160,background:t.card,borderBottom:`0.5px solid ${t.line}`,display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
        <Ico n={meta.icon} size={56} color={t.tert}/>
        <button onClick={onBack} style={{position:"absolute",top:16,left:16,background:dark?"rgba(0,0,0,0.5)":"rgba(255,255,255,0.85)",border:`0.5px solid ${t.line2}`,color:t.primary,borderRadius:12,padding:"7px 13px",fontSize:12,cursor:"pointer",fontFamily:F,display:"flex",alignItems:"center",gap:6,backdropFilter:"blur(8px)"}}>
          <Ico n="arL" size={13} color={t.primary}/>Retour</button>
        <button onClick={()=>setShowQr(true)} style={{position:"absolute",top:16,right:16,background:dark?"rgba(0,0,0,0.5)":"rgba(255,255,255,0.85)",border:`0.5px solid ${t.line2}`,color:t.primary,borderRadius:12,padding:"7px 13px",fontSize:12,cursor:"pointer",fontFamily:F,display:"flex",alignItems:"center",gap:6,backdropFilter:"blur(8px)"}}>
          <Ico n="qr" size={13} color={t.primary}/>QR</button>
        {merchant.verified&&<div style={{position:"absolute",bottom:12,right:14}}><Chip label="Vérifié" color="green"/></div>}
      </div>

      {}
      {showQr&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
          <div style={{background:t.card,borderRadius:24,padding:28,width:"100%",maxWidth:320,textAlign:"center"}}>
            <Lbl style={{marginBottom:8,textAlign:"center"}}>QR CODE BOUTIQUE</Lbl>
            <H size={16} style={{marginBottom:4}}>{merchant.name}</H>
            <div style={{width:160,height:160,margin:"0 auto 16px",background:t.primary,borderRadius:12,padding:12,display:"grid",gridTemplateColumns:"repeat(8,1fr)",gap:2}}>
              {Array.from({length:64},(_,i)=><div key={i} style={{background:Math.random()>0.45||(i<8||i>=56||i%8===0||i%8===7)?t.inv:"transparent",borderRadius:1}}/>)}
            </div>
            <div style={{fontSize:11,color:t.sec,marginBottom:16,lineHeight:1.6}}>Partagez ce QR pour que vos contacts accèdent directement à cette boutique.</div>
            <button onClick={()=>setShowQr(false)} style={{width:"100%",padding:"12px",borderRadius:12,border:"none",background:t.primary,color:t.inv,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:F}}>Fermer</button>
          </div></div>
      )}

      <div style={{padding:"18px 16px 100px"}}>
        {}
        <div style={{marginBottom:20}}>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:6}}>
            <H size={20}>{merchant.name}</H>
            <Chip label={meta.label} color={meta.color}/></div>
          <div style={{fontSize:12,color:t.sec,lineHeight:1.6,marginBottom:10}}>{merchant.desc}</div>
          <div style={{display:"flex",alignItems:"center",gap:5}}>
            <Ico n="mappin" size={13} color={t.sec}/>
            <span style={{fontSize:12,color:t.sec}}>{merchant.city}</span></div></div>

        {}
        <Lbl style={{marginBottom:12}}>
          {merchant.type==="restaurant"?"Menu":merchant.type==="barber"||merchant.type==="salon"||merchant.type==="spa"?"Services":"Produits & services"}
        </Lbl>

        {SHOWN.map(prod=>{
          const netComm = ((prod.price*prod.commission/100)*0.9).toFixed(2);
          const isBoughtElsewhere = (purchasedIds||[]).includes(prod.id);
          const effectiveStatus = getOrderStatus(prod.id) || (isBoughtElsewhere?"validated":null);

          return (
            <div key={prod.id} style={{background:t.card,border:`0.5px solid ${effectiveStatus==="validated"?t.gM:t.line}`,borderRadius:16,padding:"14px 16px",marginBottom:10,boxShadow:t.shadow}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
                <div style={{width:44,height:44,borderRadius:12,background:t.card2,border:`0.5px solid ${t.line}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <Ico n={meta.icon} size={18} color={t.sec}/></div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:3}}>
                    <div style={{fontSize:14,fontWeight:600,color:t.primary}}>{prod.name}</div>
                    <div style={{fontSize:16,fontWeight:700,color:t.primary,flexShrink:0,marginLeft:8}}>${prod.price}</div>
                  </div>
                  <div style={{fontSize:11,color:t.sec,marginBottom:8,lineHeight:1.5}}>{prod.desc}</div>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                    <Chip label={`+$${netComm} net`} color="green"/>
                    <span style={{fontSize:10,color:t.tert}}>{prod.commission}% commission</span></div>

                  {}
                  {!effectiveStatus&&(
                    <div style={{background:t.card2,borderRadius:10,padding:"7px 10px",display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                      <Ico n="lock" size={13} color={t.tert}/>
                      <span style={{fontSize:11,color:t.tert}}>Achetez pour débloquer votre lien d'affiliation</span>
                    </div>
                  )}
                  {effectiveStatus==="ordered"&&(
                    <div style={{background:t.aL,border:`0.5px solid ${t.amber}40`,borderRadius:10,padding:"8px 10px",display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                      <Ico n="clock" size={13} color={t.amber}/>
                      <div>
                        <div style={{fontSize:11,fontWeight:600,color:t.amber}}>En attente de validation</div>
                        <div style={{fontSize:10,color:t.amber,opacity:0.8,marginTop:1}}>Le marchand doit valider votre achat</div>
                      </div></div>
                  )}
                  {effectiveStatus==="validated"&&(
                    <div style={{background:t.gL,border:`0.5px solid ${t.gM}`,borderRadius:10,padding:"8px 10px",display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                      <Ico n="check" size={13} color={t.green} sw={2.5}/>
                      <div>
                        <div style={{fontSize:11,fontWeight:600,color:t.green}}>Achat validé — lien disponible</div>
                        <div style={{fontSize:10,color:t.green,opacity:0.8,marginTop:1}}>Vous pouvez générer et copier votre lien</div>
                      </div></div>
                  )}

                  {}
                  <div style={{display:"flex",gap:8}}>
                    {!effectiveStatus&&(
                      <button onClick={()=>handleOrder(prod)}
                        style={{width:"100%",padding:"10px 0",borderRadius:12,border:"none",background:t.primary,color:t.inv,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:F}}>
                        Commander — ${prod.price}</button>
                    )}
                    {effectiveStatus==="ordered"&&(
                      <div style={{width:"100%",padding:"10px 0",borderRadius:12,background:t.card2,textAlign:"center",fontSize:12,fontWeight:600,color:t.sec}}>
                        En attente de validation…</div>
                    )}
                    {effectiveStatus==="validated"&&(
                      <button onClick={()=>handleGenerateLink(prod)}
                        style={{width:"100%",padding:"10px 0",borderRadius:12,border:"none",background:t.green,color:"#000",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:F,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                        <Ico n="link" size={14} color="#000"/>Générer mon lien</button>
                    )}
                  {effectiveStatus==="rejected"&&(
                    <div style={{width:"100%",padding:"10px 0",borderRadius:12,background:t.rL,textAlign:"center",fontSize:11,fontWeight:600,color:t.red}}>
                      Refusé — retournez en boutique
                    </div>
                  )}
</div></div></div></div>);
        })}

        {}
        {hasMore&&(
          <button onClick={()=>setShowMore(s=>!s)}
            style={{width:"100%",padding:"12px",borderRadius:14,border:`0.5px solid ${t.line2}`,background:"transparent",color:t.sec,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:F,marginTop:4}}>
            {showMore?`Réduire ↑`:`Afficher plus (${merchant.products.length-3} autres) ↓`}</button>
        )}</div></div>);
}

function CustomerShell({ onLogout }) {
  const {profile}=useAuth();
  const [tab,setTab]=useState("home");
  const [activeMerchant,setActiveMerchant]=useState(null);
  const [purchasedIds,setPurchasedIds]=useState([]);
  const [withdrawals,setWithdrawals]=useState(
    SharedDB.getWithdrawals().filter(w=>w.customerId==="usr_customer"));
  const [walletCurrency,setWalletCurrency]=useState("USD");
  const [hideBalance,setHideBalance]=useState(false);
  const balances = computeBalances(COMMISSIONS_DATA, withdrawals);
  const toUSD = (v,cur)=>cur==="CDF"?v/USD_TO_CDF:v;

  const totalAvailableUSD = balances.reduce((s,b)=>s+toUSD(b.available,b.currency),0);
  const totalPendingUSD   = balances.reduce((s,b)=>s+toUSD(b.pending,b.currency),0);
  const unpaidFees        = COMMISSIONS_DATA.filter(co=>co.status==="locked").reduce((s,co)=>s+co.fee,0);
  const liveWithdrawals = withdrawals;

  const weekEarnings  = COMMISSIONS_DATA.filter(co=>co.status==="available").slice(0,3).reduce((s,co)=>s+toUSD(co.net,co.currency),0);
  const monthEarnings = COMMISSIONS_DATA.filter(co=>co.status==="available").reduce((s,co)=>s+toUSD(co.net,co.currency),0);
  const [feeSubmitted,setFeeSubmitted]=useState(
    FeePaymentsDB.getByUid("usr_customer").some(f=>f.status==="pending"));
  const feeStatus = unpaidFees<=0 ? "clear"
    : FeePaymentsDB.getByUid("usr_customer").some(f=>f.status==="validated") ? "clear"
    : feeSubmitted ? "submitted"
    : "unpaid";

  const finances = { totalAvailableUSD, totalPendingUSD, unpaidFees, balances, liveWithdrawals, weekEarnings, monthEarnings, feeStatus, setFeeSubmitted, walletCurrency, hideBalance, setHideBalance };

  const TABS=[
    {id:"home",     icon:"home",   label:"Accueil"},
    {id:"wallet",   icon:"wallet", label:"Wallet"},
    {id:"withdraw", icon:"cash",   label:"Retraits"},
    {id:"explore",  icon:"search", label:"Explorer"},
    {id:"links",    icon:"link",   label:"Liens"},
    {id:"profile",  icon:"user",   label:"Profil"},
  ];

  if(activeMerchant) return (
    <MerchantPublicPage merchant={activeMerchant} onBack={()=>setActiveMerchant(null)} purchasedIds={purchasedIds} onPurchase={p=>setPurchasedIds(ids=>[...ids,p.id])}/>
  );

  return (
    <>
      {tab==="home"     && <CustomerHome finances={finances} onExplore={()=>setTab("explore")} onGoWallet={()=>setTab("wallet")} onGoWithdraw={()=>setTab("withdraw")} onFeeSubmitted={()=>setFeeSubmitted(true)} hideBalance={hideBalance} setHideBalance={setHideBalance} walletCurrency={walletCurrency}/>}
      {tab==="wallet"   && <CustomerWallet withdrawals={withdrawals} onGoWithdraw={()=>setTab("withdraw")} walletCurrency={walletCurrency} setWalletCurrency={setWalletCurrency} hideBalance={hideBalance} setHideBalance={setHideBalance}/>}
      {tab==="withdraw" && <CustomerWithdraw withdrawals={withdrawals} setWithdrawals={setWithdrawals}/>}
      {tab==="explore"  && <CustomerExplore onMerchant={m=>setActiveMerchant(m)}/>}
      {tab==="links"    && <CustomerLinks/>}
      {tab==="profile"  && <CustomerProfile onLogout={onLogout} walletCurrency={walletCurrency} setWalletCurrency={setWalletCurrency}/>}
      <BottomNav tabs={TABS} active={tab} onSelect={setTab}/>
    </>);
}

function MerchantShell({ onLogout }) {
  const [tab,setTab]=useState("dashboard");
  const TABS=[
    {id:"dashboard",icon:"home",label:"Dashboard"},
    {id:"products",icon:"store",label:"Produits"},
    {id:"orders",icon:"check2",label:"Commandes"},
    {id:"withdrawals",icon:"cash",label:"Retraits"},
    {id:"analytics",icon:"chart",label:"Analytics"},
    {id:"profile",icon:"user",label:"Boutique"},
  ];
  return (
    <>
      {tab==="dashboard"&&<MerchantDashboardTab/>}
      {tab==="products"&&<MerchantProductsTab/>}
      {tab==="orders"&&<MerchantOrdersTab/>}
      {tab==="analytics"&&<MerchantAnalyticsTab/>}
      {tab==="withdrawals"&&<MerchantWithdrawalsTab/>}
      {tab==="profile"&&<MerchantProfileTab onLogout={onLogout}/>}
      <BottomNav tabs={TABS} active={tab} onSelect={setTab}/>
    </>);
}

function AdminProfileTab({ onLogout }) {
  const {dark}=useTheme(); const t=Tk(dark);
  const {profile}=useAuth();
  return (
    <div style={{padding:"20px 16px 100px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
        <div><Lbl style={{marginBottom:4}}>ADMINISTRATION</Lbl><H size={22}>Mon profil</H></div>
        <ThemeToggle/></div>
      <Card style={{marginBottom:16,textAlign:"center"}}>
        <div style={{width:64,height:64,borderRadius:"50%",background:t.rL,border:`0.5px solid ${t.red}30`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px"}}>
          <Ico n="shield" size={28} color={t.red}/></div>
        <H size={17}>{profile?.displayName||"Admin SWIIN"}</H>
        <div style={{fontSize:12,color:t.sec,marginTop:4}}>{profile?.email}</div>
        <div style={{marginTop:10}}><Chip label="Admin" color="red"/></div>
      </Card>
      {[
        {n:"shield",l:"Sécurité & accès"},
        {n:"bell",  l:"Notifications"},
        {n:"eye",   l:"Journal d'activité"},
        {n:"users", l:"Gestion des rôles"},
      ].map(item=>(
        <Card key={item.l} style={{marginBottom:8}} onClick={()=>{}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <Ico n={item.n} size={18} color={t.sec}/>
              <span style={{fontSize:14,color:t.primary}}>{item.l}</span></div>
            <Ico n="arR" size={16} color={t.tert}/></div>
        </Card>
      ))}
      <Btn v="danger" icon="logout" style={{marginTop:16}} onClick={onLogout}>
        Se déconnecter
      </Btn></div>);
}

function AdminShell({ onLogout }) {
  const [tab,setTab]=useState("overview");
  const TABS=[
    {id:"overview", icon:"home",    label:"Global"},
    {id:"users",    icon:"users",   label:"Utilisateurs"},
    {id:"merchants",icon:"store",   label:"Marchands"},
    {id:"fees",     icon:"percent", label:"Frais"},
    {id:"alerts",   icon:"alert",   label:"Alertes"},
    {id:"profile",  icon:"user",    label:"Profil"},
  ];
  return (
    <>
      {tab==="overview"  && <AdminOverviewTab/>}
      {tab==="users"     && <AdminUsersTab/>}
      {tab==="verify"    && <AdminVerifyTab/>}
      {tab==="merchants" && <AdminMerchantsTab/>}
      {tab==="fees"      && <AdminFeesTab/>}
      {tab==="alerts"    && <AdminAlertsTab/>}
      {tab==="profile"   && <AdminProfileTab onLogout={onLogout}/>}
      <BottomNav tabs={TABS} active={tab} onSelect={setTab}/>
    </>);
}
const S = {
  SPLASH:"splash", ROLE:"role", LOGIN:"login", FORGOT:"forgot",
  REG_C:"reg_customer", REG_M:"reg_merchant", REG_SM:"reg_super",
  APP:"app",
};

function AppRouter() {
  const {user,profile,loading,logout}=useAuth();
  const [screen,setScreen]=useState(S.SPLASH);
  const [otpData,setOtpData]=useState(null);

  const goToApp=(prof)=>{
    if(prof&&prof.status==="pending_otp"){
      setOtpData({uid:prof.uid,phone:prof.phone||"",otpCode:prof._pendingOtp||""});
      setScreen("otp");
    } else {
      setScreen(S.APP);
    }
  };

  const handleSplashDone=()=>{
    if(user&&profile) goToApp(profile);
    else setScreen(S.ROLE);
  };

  useEffect(()=>{
    if(loading) return;
    if(user&&profile&&screen!==S.APP&&screen!=="otp") goToApp(profile);
  },[user,profile,loading]);

  const handleLogout=()=>{ logout(); setScreen(S.ROLE); };
  const handleSuccess=(role,uid,otpCode)=>{
    if(otpCode&&uid){ setOtpData({uid,phone:"",otpCode}); setScreen("otp"); }
    else setScreen(S.APP);
  };

  const handleRoleSelect=(sel)=>{
    if(sel==="login")               setScreen(S.LOGIN);
    else if(sel==="customer")       setScreen(S.REG_C);
    else if(sel==="merchant")       setScreen(S.REG_M);
    else if(sel==="super_merchant") setScreen(S.REG_SM);
  };

  if(screen===S.SPLASH) return <SplashScreen onDone={handleSplashDone}/>;

  if(screen===S.APP && user && profile) {
    const role=profile.role;
    if(role==="customer")       return <CustomerShell onLogout={handleLogout}/>;
    if(role==="merchant")       return <MerchantShell onLogout={handleLogout}/>;
    if(role==="admin")          return <AdminShell    onLogout={handleLogout}/>;
    if(role==="super_merchant") return <MerchantShell onLogout={handleLogout}/>;
  }

  return (
    <div style={{overflowY:"auto",height:"100%"}}>
      {screen===S.ROLE   && <RoleSelectionScreen onSelect={handleRoleSelect}/>}
      {screen===S.LOGIN  && <LoginScreen onSuccess={handleSuccess} onRegister={()=>setScreen(S.ROLE)} onForgot={()=>setScreen(S.FORGOT)}/>}
      {screen===S.FORGOT && <ForgotScreen onBack={()=>setScreen(S.LOGIN)}/>}
      {screen===S.REG_C  && <CustomerRegisterScreen onSuccess={handleSuccess} onLogin={()=>setScreen(S.LOGIN)}/>}
      {screen===S.REG_M  && <MerchantRegisterScreen onSuccess={handleSuccess} onLogin={()=>setScreen(S.LOGIN)}/>}
      {screen===S.REG_SM && <SuperRegisterScreen onSuccess={handleSuccess} onLogin={()=>setScreen(S.LOGIN)}/>}
      {screen==="otp"    && otpData && <OtpScreen uid={otpData.uid} phone={otpData.phone} otpCode={otpData.otpCode} onVerified={()=>setScreen(S.APP)}/>}
    </div>);
}
export default function SwiinAuth() {
  const [dark,setDark]=useState(true);
  const t=Tk(dark);
  return (
    <ThemeCtx.Provider value={{dark,toggle:()=>setDark(d=>!d)}}>
      <AuthProvider>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"/>
        <div style={{fontFamily:F,background:t.bg,color:t.primary,minHeight:"100vh",maxWidth:430,margin:"0 auto",display:"flex",flexDirection:"column",transition:"background 0.3s,color 0.3s",position:"relative",overflow:"hidden"}}>
          <AppRouter/></div>
      </AuthProvider>
    </ThemeCtx.Provider>);
}
