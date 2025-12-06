import React from 'react';
import { Sube, Kullanici, Rol, Yetki, KullaniciRol, RolYetki, Deger, UstKategori, Kategori, EFatura, EFaturaExcelRow, B2BEkstre, B2BEkstreExcelRow, DigerHarcama, HarcamaTipi, Stok, StokFiyat, StokSayim, Calisan, PuantajSecimi, Puantaj, Gelir, GelirEkstra, AvansIstek } from './types';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:8000/api/v1' : 'https://gumusbulut.onrender.com/api/v1');
//export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://gumusbulut.onrender.com/api/v1';

// Heroicons (Outline)
// Updated to accept className prop
export const Icons = {
  Dashboard: (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={props.className || "w-5 h-5"}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>,
  Branch: (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={props.className || "w-5 h-5"}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h6.75M9 11.25h6.75M9 15.75h6.75M9 20.25h6.75" /></svg>,
  Users: (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={props.className || "w-5 h-5"}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>,
  Roles: (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={props.className || "w-5 h-5"}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-3.741-5.741M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 9.563A4.502 4.502 0 0013.5 12a4.5 4.5 0 00-4.5-2.438zM12 12.75L12 17.25" /></svg>,
  Permissions: (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={props.className || "w-5 h-5"}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" /></svg>,
  Assignments: (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={props.className || "w-5 h-5"}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>,
  Invoice: (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={props.className || "w-5 h-5"}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></svg>,
  SuperCategory: (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={props.className || "w-5 h-5"}><path strokeLinecap="round" strokeLinejoin="round" d="M6 12.75c0 .414.336.75.75.75h10.5a.75.75 0 00.75-.75V8.25a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v4.5zm0 3.75c0 .414.336.75.75.75h10.5a.75.75 0 00.75-.75V12a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v4.5zm0 3.75c0 .414.336.75.75.75h10.5a.75.75 0 00.75-.75V15.75a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v4.5z" /></svg>,
  Category: (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={props.className || "w-5 h-5"}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" /></svg>,
  Expenses: (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={props.className || "w-5 h-5"}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h6m-3-5.25V21M6.75 8.25V6a2.25 2.25 0 012.25-2.25h6a2.25 2.25 0 012.25 2.25v2.25m-13.5 0A2.25 2.25 0 006.75 6v2.25a2.25 2.25 0 002.25 2.25h6a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25h-6A2.25 2.25 0 006.75 6v2.25" /></svg>,
  Income: (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={props.className || "w-5 h-5"}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>,
  Stock: (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={props.className || "w-5 h-5"}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10.5 11.25h3M12 15h.008" /></svg>,
  Employee: (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={props.className || "w-5 h-5"}><path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Timesheet: (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={props.className || "w-5 h-5"}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-3.75h.008v.008H12v-.008z" /></svg>,
  Advance: (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={props.className || "w-5 h-5"}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>,
  Logout: (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={props.className || "w-6 h-6"}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>,
  Edit: (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={props.className || "w-5 h-5"}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>,
  Delete: (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={props.className || "w-5 h-5"}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c1.153 0 2.243.096 3.298.26m-3.298-.26l-.622 2.207a2.25 2.25 0 002.244 2.077H18.27a2.25 2.25 0 002.244-2.077L19.23 5.79M14.74 9H9.26m5.481 0l-1.071-3.214A1.125 1.125 0 0012.383 5H11.617a1.125 1.125 0 00-1.07 1.286L9.26 9z" /></svg>,
  Add: (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={props.className || "w-5 h-5"}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>,
  ToggleOn: (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={props.className || "w-5 h-5 text-green-500"}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  ToggleOff: (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={props.className || "w-5 h-5 text-red-500"}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Eye: (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={props.className || "w-5 h-5"}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a10.477 10.477 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  EyeSlash: (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={props.className || "w-5 h-5"}><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.575M5.121 5.121A15.085 15.085 0 0112 5.25c.163 0 .322.016.48.045m10.198 10.198L12 12M5.121 5.121L12 12m6.879 6.879L5.121 5.121" /></svg>,
  UserCircle: (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={props.className || "w-6 h-6"}><path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  ChevronDown: (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={props.className || "w-4 h-4"}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>,
  ChevronLeft: (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={props.className || "w-4 h-4"}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>,
  ChevronRight: (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={props.className || "w-4 h-4"}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>,
  Upload: (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={props.className || "w-5 h-5"}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>,
  Download: (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={props.className || "w-5 h-5"}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>,
  SilverCloudLogo: (props: { className?: string }) => (
    <svg
      className={props.className || "w-10 h-10 text-sky-400"}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-2.666-5.003 3.75 3.75 0 00-7.433-1.636 4.5 4.5 0 00-8.42 4.24L2.25 15z"
      />
    </svg>
  ),
  CheckedSquare: (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={props.className || "w-5 h-5 text-blue-600"}><path fillRule="evenodd" d="M16.403 3.94a.75.75 0 01.07 1.057l-6.5 7.5a.75.75 0 01-1.127.075L4.596 9.06a.75.75 0 011.057-1.057l2.873 2.513 5.82-6.72a.75.75 0 011.057-.07zM3 3.5A1.5 1.5 0 014.5 2h11A1.5 1.5 0 0117 3.5v11a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 013 14.5v-11z" clipRule="evenodd" /></svg>,
  EmptySquare: (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={props.className || "w-5 h-5 text-gray-400"}><rect x="5.25" y="5.25" width="13.5" height="13.5" rx="1" ry="1" /></svg>,
  ClipboardDocumentList: (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={props.className || "w-5 h-5"}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  CreditCard: (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={props.className || "w-5 h-5"}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h6m-3-5.25V21M6.75 8.25V6a2.25 2.25 0 012.25-2.25h6a2.25 2.25 0 012.25 2.25v2.25m-13.5 0A2.25 2.25 0 006.75 6v2.25a2.25 2.25 0 002.25 2.25h6a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25h-6A2.25 2.25 0 006.75 6v2.25" /></svg>,
  ExclamationTriangle: (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={props.className || "w-4 h-4 text-orange-500"}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>,
  Money: (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={props.className || "w-5 h-5"}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.509 10.38 12.002 12 12 12H9m7.5-4.5H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25H6A2.25 2.25 0 013.75 18V9.75A2.25 2.25 0 016 7.5h1.5m0-3h-.375a1.125 1.125 0 01-1.125-1.125V3.75c0-.621.504-1.125 1.125-1.125h1.5C9.012 2.625 10.5 4.113 10.5 6v1.5m0 0h3m-3 0H9m12 0h.375a1.125 1.125 0 011.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-.375m-1.5-1.5h.375A1.125 1.125 0 0022.5 12.75v3.75c0 .621-.504 1.125-1.125 1.125h-.375m-15-6H9.75" /></svg>,
  Print: (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={props.className || "w-5 h-5"}><path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0h.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.319 0a1.125 1.125 0 00-1.12-1.227H7.231c-.662 0-1.18.568-1.12 1.227m11.319 0L16.408 3.569a1.125 1.125 0 00-1.12-1.227H8.712c-.662 0-1.18.568-1.12 1.227L6.34 18" /></svg>,
  Report: (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={props.className || "w-5 h-5"}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></svg>,
  DocumentReport: (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={props.className || "w-5 h-5"}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>,
  CheckCircle: (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={props.className || "w-5 h-5"}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  InformationCircle: (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={props.className || "w-5 h-5"}><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>,
  Close: (props: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={props.className || "w-5 h-5"}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>,
  Loading: (props: { className?: string }) => (
    <svg className={`animate-spin ${props.className || "w-5 h-5"}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  ),
};


// --- PERMISSION CONSTANTS ---
// Specific action/field permissions
export const OZEL_FATURA_YETKI_ADI = 'Fatura Ozel Yetkisi';
export const PUANTAJ_HISTORY_ACCESS_YETKI_ADI = "Puantaj Geçmiş Veri Erişimi";
export const GELIR_GECMISI_YETKI_ADI = "Gelir Geçmiş Veri Erişimi";
export const GIZLI_KATEGORI_YETKISI_ADI = "Gizli Kategori Veri Erişimi";
export const YAZDIRMA_YETKISI_ADI = "Yazdırma Yetkisi";
export const EXCELE_AKTAR_YETKISI_ADI = "Excele Aktar";
export const CALISAN_TALEP_ISE_GIRIS_ONAYI_YETKI_ADI = 'İşe Giriş Onayı (İşlem)';
export const CALISAN_TALEP_SSK_ONAYI_YETKI_ADI = 'SSK Onayı (İşlem)';

// Screen view permissions
export const DASHBOARD_EKRANI_YETKI_ADI = 'Dashboard Ekranı Görüntüleme';
export const SUBE_YONETIMI_EKRANI_YETKI_ADI = 'Şube Yönetimi Ekranı Görüntüleme';
export const DEGER_YONETIMI_EKRANI_YETKI_ADI = 'Değer Yönetimi Ekranı Görüntüleme';
export const KULLANICI_YONETIMI_EKRANI_YETKI_ADI = 'Kullanıcı Yönetimi Ekranı Görüntüleme';
export const ROL_YONETIMI_EKRANI_YETKI_ADI = 'Rol Yönetimi Ekranı Görüntüleme';
export const YETKI_YONETIMI_EKRANI_YETKI_ADI = 'Yetki Yönetimi Ekranı Görüntüleme';
export const KULLANICI_ROL_ATAMA_EKRANI_YETKI_ADI = 'Kullanıcı Rol Atama Ekranı Görüntüleme';
export const ROL_YETKI_ATAMA_EKRANI_YETKI_ADI = 'Rol Yetki Atama Ekranı Görüntüleme';
export const UST_KATEGORI_YONETIMI_EKRANI_YETKI_ADI = 'Üst Kategori Yönetimi Ekranı Görüntüleme';
export const KATEGORI_YONETIMI_EKRANI_YETKI_ADI = 'Kategori Yönetimi Ekranı Görüntüleme';
export const FATURA_YUKLEME_EKRANI_YETKI_ADI = 'Fatura Yükleme Ekranı Görüntüleme';
export const FATURA_KATEGORI_ATAMA_EKRANI_YETKI_ADI = 'Fatura Kategori Atama Ekranı Görüntüleme';
export const B2B_YUKLEME_EKRANI_YETKI_ADI = 'B2B Ekstre Yükleme Ekranı Görüntüleme';
export const B2B_KATEGORI_ATAMA_EKRANI_YETKI_ADI = 'B2B Kategori Atama Ekranı Görüntüleme';
export const DIGER_HARCAMALAR_EKRANI_YETKI_ADI = 'Diğer Harcamalar Ekranı Görüntüleme';
export const GELIR_GIRISI_EKRANI_YETKI_ADI = 'Gelir Girişi Ekranı Görüntüleme';
export const STOK_TANIMLAMA_EKRANI_YETKI_ADI = 'Stok Tanımlama Ekranı Görüntüleme';
export const STOK_FIYAT_TANIMLAMA_EKRANI_YETKI_ADI = 'Stok Fiyat Tanımlama Ekranı Görüntüleme';
export const STOK_SAYIM_EKRANI_YETKI_ADI = 'Stok Sayım Ekranı Görüntüleme';
export const CALISAN_YONETIMI_EKRANI_YETKI_ADI = 'Çalışan Yönetimi Ekranı Görüntüleme';
export const PUANTAJ_SECIM_YONETIMI_EKRANI_YETKI_ADI = 'Puantaj Seçim Yönetimi Ekranı Görüntüleme';
export const PUANTAJ_GIRISI_EKRANI_YETKI_ADI = 'Puantaj Girişi Ekranı Görüntüleme';
export const AVANS_TALEBI_EKRANI_YETKI_ADI = 'Avans Talebi Ekranı Görüntüleme';
export const E_FATURA_REFERANS_YONETIMI_EKRANI_YETKI_ADI = 'e-Fatura Referans Yönetimi Ekranı Görüntüleme';
export const ODEME_REFERANS_YONETIMI_EKRANI_YETKI_ADI = 'Ödeme Referans Yönetimi Ekran Görüntüleme';
export const NAKIT_GIRISI_EKRANI_YETKI_ADI = 'Nakit Girişi Ekranı Görüntüleme';
export const ODEME_YUKLEME_EKRANI_YETKI_ADI = 'Ödeme Yükleme Ekranı Görüntüleme';
export const ODEME_KATEGORI_ATAMA_EKRANI_YETKI_ADI = 'Ödeme Kategori Atama Ekranı Görüntüleme';
export const FINANSAL_OZET_YETKI_ADI = "Finansal Özet Görme Yetkisi";
export const NAKIT_YATIRMA_RAPORU_YETKI_ADI = 'Nakit Yatırma Kontrol Raporu Görüntüleme';
export const ODEME_RAPOR_YETKI_ADI = 'Ödeme Rapor Görüntüleme';
export const FATURA_RAPOR_YETKI_ADI = 'Fatura Rapor Görüntüleme';
export const FATURA_DIGER_HARCAMA_RAPOR_YETKI_ADI = 'Fatura & Diğer Harcama Rapor Görüntüleme';
export const POS_HAREKETLERI_YUKLEME_EKRANI_YETKI_ADI = 'POS Hareketleri Yükleme Ekranı Görüntüleme';
export const POS_KONTROL_DASHBOARD_YETKI_ADI = 'POS Kontrol Dashboard Görüntüleme';
export const ONLINE_KONTROL_DASHBOARD_YETKI_ADI = 'Online Kontrol Dashboard Görüntüleme';
export const YEMEK_CEKI_EKRANI_YETKI_ADI = 'Yemek Çeki Ekranı Görüntüleme';
export const YEMEK_CEKI_KONTROL_DASHBOARD_YETKI_ADI = 'Yemek Çeki Kontrol Dashboard Görüntüleme';
export const TABAK_SAYISI_YUKLEME_EKRANI_YETKI_ADI = 'Tabak Sayısı Yükleme Ekranı Görüntüleme';
export const VPS_DASHBOARD_YETKI_ADI = 'VPS Dashboard Görüntüleme';
export const BAYI_KARLILIK_RAPORU_YETKI_ADI = 'Bayi Karlılık Raporu Görüntüleme';
export const FATURA_BOLME_YONETIMI_EKRANI_YETKI_ADI = 'Fatura Bölme Yönetimi Ekranı Görüntüleme';
export const OZET_KONTROL_RAPORU_YETKI_ADI = 'Özet Kontrol Raporu Görüntüleme';
export const NAKIT_AKIS_GELIR_RAPORU_YETKI_ADI = 'Nakit Akış - Gelir Raporu Görüntüleme';
export const CALISAN_TALEP_EKRANI_YETKI_ADI = 'Çalışan Talep Ekranı Görüntüleme';
export const CARI_BORC_TAKIP_SISTEMI_YETKI_ADI = 'Cari Borç Takip Sistemi Görüntüleme';
export const CARI_BORC_YONETIMI_EKRANI_YETKI_ADI = 'Cari Borç Yönetimi Ekranı Görüntüleme';
export const MUTABAKAT_YONETIMI_EKRANI_YETKI_ADI = 'Mutabakat Yönetimi Ekranı Görüntüleme';


// --- MENU STRUCTURE ---
export const DASHBOARD_ITEM = { label: 'Dashboard', path: '/', icon: Icons.Dashboard, permission: DASHBOARD_EKRANI_YETKI_ADI };

export const MENU_GROUPS = [
    {
        title: 'Sistem Tabloları',
        items: [
            { label: 'Şube Yönetimi', path: '/branches', icon: Icons.Branch, permission: SUBE_YONETIMI_EKRANI_YETKI_ADI },
            { label: 'Değer Yönetimi', path: '/degerler', icon: Icons.Stock, permission: DEGER_YONETIMI_EKRANI_YETKI_ADI },
            { label: 'Kullanıcı Yönetimi', path: '/users', icon: Icons.Users, permission: KULLANICI_YONETIMI_EKRANI_YETKI_ADI },
            { label: 'Rol Yönetimi', path: '/roles', icon: Icons.Roles, permission: ROL_YONETIMI_EKRANI_YETKI_ADI },
            { label: 'Yetki Yönetimi', path: '/permissions', icon: Icons.Permissions, permission: YETKI_YONETIMI_EKRANI_YETKI_ADI },
            { label: 'Kullanıcı Rol Atama', path: '/user-role-assignment', icon: Icons.Assignments, permission: KULLANICI_ROL_ATAMA_EKRANI_YETKI_ADI },
            { label: 'Rol Yetki Atama', path: '/role-permission-assignment', icon: Icons.Assignments, permission: ROL_YETKI_ATAMA_EKRANI_YETKI_ADI },
            { label: 'e-Fatura Referans Yönetimi', path: '/e-fatura-referans', icon: Icons.Invoice, permission: E_FATURA_REFERANS_YONETIMI_EKRANI_YETKI_ADI },
            { label: 'Ödeme Referans Yönetimi', path: '/odeme-referans', icon: Icons.Invoice, permission: ODEME_REFERANS_YONETIMI_EKRANI_YETKI_ADI },
            { label: 'Cari Borç Yönetimi', path: '/cari-borc-yonetimi', icon: Icons.Invoice, permission: CARI_BORC_YONETIMI_EKRANI_YETKI_ADI },
        ]
    },
    {
        title: 'Kategori Sistemi',
        items: [
            { label: 'Üst Kategori Yönetimi', path: '/ust-kategoriler', icon: Icons.SuperCategory, permission: UST_KATEGORI_YONETIMI_EKRANI_YETKI_ADI },
            { label: 'Kategori Yönetimi', path: '/kategoriler', icon: Icons.Category, permission: KATEGORI_YONETIMI_EKRANI_YETKI_ADI },
        ]
    },
    {
        title: 'Fatura/Harcama',
        items: [
            { label: 'Fatura Yükleme', path: '/invoice-upload', icon: Icons.Upload, permission: FATURA_YUKLEME_EKRANI_YETKI_ADI },
            { label: 'Fatura Kategori Atama', path: '/invoice-category-assignment', icon: Icons.Category, permission: FATURA_KATEGORI_ATAMA_EKRANI_YETKI_ADI },
            { label: 'Fatura Bölme Yönetimi', path: '/fatura-bolme-yonetimi', icon: Icons.Invoice, permission: FATURA_BOLME_YONETIMI_EKRANI_YETKI_ADI },
            { label: 'B2B Ekstre Yükleme', path: '/b2b-upload', icon: Icons.ClipboardDocumentList, permission: B2B_YUKLEME_EKRANI_YETKI_ADI },
            { label: 'B2B Ekstre Kategori Atama', path: '/b2b-category-assignment', icon: Icons.Category, permission: B2B_KATEGORI_ATAMA_EKRANI_YETKI_ADI },
            { label: 'Ödeme Yükleme', path: '/odeme-yukleme', icon: Icons.Upload, permission: ODEME_YUKLEME_EKRANI_YETKI_ADI },
            { label: 'Ödeme Kategori Atama', path: '/odeme-kategori-atama', icon: Icons.Category, permission: ODEME_KATEGORI_ATAMA_EKRANI_YETKI_ADI },
            { label: 'Diğer Harcamalar', path: '/other-expenses', icon: Icons.CreditCard, permission: DIGER_HARCAMALAR_EKRANI_YETKI_ADI },
            { label: 'POS Hareketleri Yükleme', path: '/pos-hareketleri-yukleme', icon: Icons.Upload, permission: POS_HAREKETLERI_YUKLEME_EKRANI_YETKI_ADI },
            { label: 'Tabak Sayısı Yükleme', path: '/tabak-sayisi-yukleme', icon: Icons.Upload, permission: TABAK_SAYISI_YUKLEME_EKRANI_YETKI_ADI },
            { label: 'Yemek Çeki', path: '/yemek-ceki', icon: Icons.CreditCard, permission: YEMEK_CEKI_EKRANI_YETKI_ADI },
            { label: 'Mutabakat Yönetimi', path: '/mutabakat-yonetimi', icon: Icons.Invoice, permission: MUTABAKAT_YONETIMI_EKRANI_YETKI_ADI },
        ]
    },
    {
        title: 'Gelir',
        items: [
            { label: 'Gelir Girişi', path: '/gelir', icon: Icons.Income, permission: GELIR_GIRISI_EKRANI_YETKI_ADI },
            { label: 'Nakit Girişi', path: '/nakit-girisi', icon: Icons.Money, permission: NAKIT_GIRISI_EKRANI_YETKI_ADI },
        ]
    },
    {
        title: 'Stok',
        items: [
            { label: 'Stok Tanımlama', path: '/stock-definitions', icon: Icons.Stock, permission: STOK_TANIMLAMA_EKRANI_YETKI_ADI },
            { label: 'Stok Fiyat Tanımlama', path: '/stock-prices', icon: Icons.Stock, permission: STOK_FIYAT_TANIMLAMA_EKRANI_YETKI_ADI },
            { label: 'Stok Sayım', path: '/stock-count', icon: Icons.ClipboardDocumentList, permission: STOK_SAYIM_EKRANI_YETKI_ADI },
        ]
    },
    {
        title: 'Çalışan',
        items: [
            { label: 'Çalışan Yönetimi', path: '/calisanlar', icon: Icons.Employee, permission: CALISAN_YONETIMI_EKRANI_YETKI_ADI },
            { label: 'Puantaj Seçim Yönetimi', path: '/puantaj-secim', icon: Icons.Timesheet, permission: PUANTAJ_SECIM_YONETIMI_EKRANI_YETKI_ADI },
            { label: 'Puantaj Girişi', path: '/puantaj', icon: Icons.Timesheet, permission: PUANTAJ_GIRISI_EKRANI_YETKI_ADI },
            { label: 'Avans Talebi', path: '/avans', icon: Icons.Advance, permission: AVANS_TALEBI_EKRANI_YETKI_ADI },
            { label: 'Çalışan Talep', path: '/calisan-talep', icon: Icons.Employee, permission: CALISAN_TALEP_EKRANI_YETKI_ADI },
        ]
    },
    {
        title: 'Rapor',
        items: [
            { label: 'Nakit Yatırma Kontrol Raporu', path: '/nakit-yatirma-raporu', icon: Icons.Report, permission: NAKIT_YATIRMA_RAPORU_YETKI_ADI },
            { label: 'Ödeme Rapor', path: '/odeme-rapor', icon: Icons.Report, permission: ODEME_RAPOR_YETKI_ADI },
            { label: 'Fatura Rapor', path: '/fatura-rapor', icon: Icons.Report, permission: FATURA_RAPOR_YETKI_ADI },
            { label: 'Fatura & Diğer Harcama Raporu', path: '/fatura-diger-harcama-rapor', icon: Icons.Report, permission: FATURA_DIGER_HARCAMA_RAPOR_YETKI_ADI },
            { label: 'POS Kontrol Dashboard', path: '/pos-kontrol-dashboard', icon: Icons.Report, permission: POS_KONTROL_DASHBOARD_YETKI_ADI },
            { label: 'Online Kontrol Dashboard', path: '/online-kontrol-dashboard', icon: Icons.Report, permission: ONLINE_KONTROL_DASHBOARD_YETKI_ADI },
            { label: 'Yemek Çeki Kontrol Dashboard', path: '/yemek-ceki-kontrol-dashboard', icon: Icons.Report, permission: YEMEK_CEKI_KONTROL_DASHBOARD_YETKI_ADI },
            { label: 'VPS Dashboard', path: '/vps-dashboard', icon: Icons.Report, permission: VPS_DASHBOARD_YETKI_ADI },
            { label: 'Bayi Karlılık Raporu', path: '/bayi-karlilik-raporu', icon: Icons.DocumentReport, permission: BAYI_KARLILIK_RAPORU_YETKI_ADI },
            { label: 'Özet Kontrol Raporu', path: '/ozet-kontrol-raporu', icon: Icons.Report, permission: OZET_KONTROL_RAPORU_YETKI_ADI },
            { label: 'Nakit Akış - Gelir', path: '/nakit-akis-gelir-raporu', icon: Icons.Report, permission: NAKIT_AKIS_GELIR_RAPORU_YETKI_ADI },
            { label: 'Cari Borç Takip Sistemi', path: '/cari-borc-takip-sistemi', icon: Icons.Report, permission: CARI_BORC_TAKIP_SISTEMI_YETKI_ADI },
        ]
    }
];


// --- MOCK DATA ---

export const MOCK_BRANCHES: Sube[] = [
  { Sube_ID: 1, Sube_Adi: 'Brandium', Aciklama: 'Brandium Şube', Aktif_Pasif: true },
  { Sube_ID: 2, Sube_Adi: 'Agora', Aciklama: 'Genel Merkez', Aktif_Pasif: true },
];

export const MOCK_USERS: Kullanici[] = [
  { Kullanici_ID: 1, Kullanici_Adi: 'Admin User', Username: 'admin', Email: 'admin@example.com', Aktif_Pasif: true },
  { Kullanici_ID: 2, Kullanici_Adi: 'Can Yılmaz', Username: 'canyilmaz', Email: 'can@example.com', Aktif_Pasif: true },
  { Kullanici_ID: 3, Kullanici_Adi: 'Ayşe Kaya', Username: 'aysekaya', Email: 'ayse@example.com', Aktif_Pasif: false },
  { Kullanici_ID: 4, Kullanici_Adi: 'Fatma Demir', Username: 'fatmademir', Email: 'fatma@example.com', Aktif_Pasif: true },
];

export const MOCK_ROLES: Rol[] = [
  { Rol_ID: 1, Rol_Adi: 'Admin', Aciklama: 'Admin - Herşeye Yetkili', Aktif_Pasif: true },
  { Rol_ID: 2, Rol_Adi: 'Muhasebeci', Aciklama: 'Muhasebe Yetkilisi2', Aktif_Pasif: true },
  { Rol_ID: 3, Rol_Adi: 'Müdür', Aciklama: 'Şube Müdürü2', Aktif_Pasif: true },
  { Rol_ID: 4, Rol_Adi: 'Çalışan', Aciklama: 'Genel Çalışan2', Aktif_Pasif: true },
];



export const MOCK_USER_ROLES: KullaniciRol[] = [];

export const MOCK_ROLE_PERMISSIONS: RolYetki[] = [
  // Admin role gets all permissions dynamically, no need to list them all here.
  // We keep a few for legacy reasons or specific checks if needed.
  { Rol_ID: 1, Yetki_ID: 6, Aktif_Pasif: true }, // Admin -> Fatura Ozel Yetkisi
  { Rol_ID: 1, Yetki_ID: 7, Aktif_Pasif: true }, // Admin -> Puantaj Geçmiş Veri Erişimi
  { Rol_ID: 1, Yetki_ID: 8, Aktif_Pasif: true }, // Admin -> Gelir Geçmiş Veri Erişimi
  { Rol_ID: 1, Yetki_ID: 9, Aktif_Pasif: true }, // Admin -> Gizli Kategori Veri Erişimi
  
  // Muhasebeci Role Permissions
  { Rol_ID: 2, Yetki_ID: 10, Aktif_Pasif: true }, // Dashboard
  { Rol_ID: 2, Yetki_ID: 20, Aktif_Pasif: true }, // Fatura Yükleme
  { Rol_ID: 2, Yetki_ID: 21, Aktif_Pasif: true }, // Fatura Kategori Atama
  { Rol_ID: 2, Yetki_ID: 22, Aktif_Pasif: true }, // B2B Yükleme
  { Rol_ID: 2, Yetki_ID: 23, Aktif_Pasif: true }, // B2B Kategori Atama
  { Rol_ID: 2, Yetki_ID: 24, Aktif_Pasif: true }, // Diğer Harcamalar
  { Rol_ID: 2, Yetki_ID: 25, Aktif_Pasif: true }, // Gelir Girişi
  { Rol_ID: 2, Yetki_ID: 28, Aktif_Pasif: true }, // Stok Sayım
  { Rol_ID: 2, Yetki_ID: 32, Aktif_Pasif: true }, // Avans Talebi

  // Çalışan Role Permissions
  { Rol_ID: 4, Yetki_ID: 31, Aktif_Pasif: true }, // Puantaj Girişi
  { Rol_ID: 4, Yetki_ID: 32, Aktif_Pasif: true }, // Avans Talebi
];

export const MOCK_DEGERLER: Deger[] = [
    { Deger_ID: 1, Deger_Adi: 'Standart KDV Oranı', Gecerli_Baslangic_Tarih: '2023-01-01', Gecerli_Bitis_Tarih: '2100-01-01', Deger_Aciklama: 'Genel KDV oranı', Deger_Tutar: 18.00 },
    { Deger_ID: 2, Deger_Adi: 'İndirimli KDV Oranı (Gıda)', Gecerli_Baslangic_Tarih: '2023-01-01', Gecerli_Bitis_Tarih: '2100-01-01', Deger_Aciklama: 'Gıda ürünleri için KDV oranı', Deger_Tutar: 8.00 },
    { Deger_ID: 3, Deger_Adi: 'Personel Yemek Ücreti', Gecerli_Baslangic_Tarih: '2024-01-01', Gecerli_Bitis_Tarih: '2024-12-31', Deger_Aciklama: 'Günlük personel yemek bedeli', Deger_Tutar: 150.00 },
    { Deger_ID: 4, Deger_Adi: 'Maksimum İskonto Oranı', Gecerli_Baslangic_Tarih: '2023-06-01', Gecerli_Bitis_Tarih: '2100-01-01', Deger_Aciklama: 'Tek seferde uygulanabilecek maksimum indirim oranı (%)', Deger_Tutar: 25.00 },
];

export const MOCK_UST_KATEGORILER: UstKategori[] = [
    { UstKategori_ID: 1, UstKategori_Adi: 'Genel Giderler', Aktif_Pasif: true},
    { UstKategori_ID: 2, UstKategori_Adi: 'Personel Giderleri', Aktif_Pasif: true},
    { UstKategori_ID: 3, UstKategori_Adi: 'Satış Gelirleri', Aktif_Pasif: true},
    { UstKategori_ID: 4, UstKategori_Adi: 'Finansal Giderler', Aktif_Pasif: false},
];

export const MOCK_KATEGORILER: Kategori[] = [
    { Kategori_ID: 1, Kategori_Adi: 'Kira Gideri', Ust_Kategori_ID: 1, Tip: 'Gider', Aktif_Pasif: true, Gizli: false },
    { Kategori_ID: 2, Kategori_Adi: 'Elektrik Faturası', Ust_Kategori_ID: 1, Tip: 'Gider', Aktif_Pasif: true, Gizli: false },
    { Kategori_ID: 3, Kategori_Adi: 'Maaş Ödemeleri', Ust_Kategori_ID: 2, Tip: 'Gider', Aktif_Pasif: true, Gizli: false },
    { Kategori_ID: 4, Kategori_Adi: 'Yemek Satışı', Ust_Kategori_ID: 3, Tip: 'Gelir', Aktif_Pasif: true, Gizli: false },
    { Kategori_ID: 5, Kategori_Adi: 'İçecek Satışı', Ust_Kategori_ID: 3, Tip: 'Gelir', Aktif_Pasif: true, Gizli: false },
    { Kategori_ID: 6, Kategori_Adi: 'Danışmanlık Ücreti', Ust_Kategori_ID: 1, Tip: 'Gider', Aktif_Pasif: true, Gizli: true },
    { Kategori_ID: 7, Kategori_Adi: 'Banka Komisyonları', Ust_Kategori_ID: 4, Tip: 'Gider', Aktif_Pasif: false, Gizli: false },
    { Kategori_ID: 8, Kategori_Adi: 'Diğer Gelirler', Ust_Kategori_ID: 3, Tip: 'Gelir', Aktif_Pasif: true, Gizli: false }, 
];


export const DEFAULT_PERIOD = (() => {
  const date = new Date();
  const year = date.getFullYear().toString().substring(2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${year}${month}`; // YYMM format like 2307
})();
export const DEFAULT_END_DATE = '2100-01-01';

export const MOCK_E_FATURALAR: EFatura[] = []; 

// Sample data for simulating Excel upload
export const MOCK_E_FATURA_EXCEL_SAMPLE: EFaturaExcelRow[] = [
  { "Alici Adi": "Tech Solutions Ltd.", "Fatura Numarasi": "INV2024001", "Fatura Tarihi": "15.07.2024", "Durum": "Onaylandı", "Tutar": 1500.75 },
  { "Alici Adi": "Green Grocers Inc.", "Fatura Numarasi": "INV2024002", "Fatura Tarihi": "16.07.2024", "Geliş Tarihi": "17.07.2024", "Senaryo": "TEMELFATURA", "Durum": "Gönderildi", "Tutar": 850.00 },
  { "Alici Adi": "Office Supplies Co.", "Fatura Numarasi": "INV2024003", "Fatura Tarihi": "10.07.2024", "Durum": "Reddedildi", "Tutar": 300.50 }, 
  { "Alici Adi": "Consulting Services", "Fatura Numarasi": "INV2024004", "Fatura Tarihi": "20.06.2024", "Durum": "Gönderildi", "Tutar": 2200.00 },
  { "Alici Adi": "Tech Solutions Ltd.", "Fatura Numarasi": "INV2024001", "Fatura Tarihi": "20.07.2024", "Durum": "Onaylandı", "Tutar": 1600.00 }, 
];

export const MOCK_B2B_EKSTRELER: B2BEkstre[] = [];

export const MOCK_B2B_EKSTRE_EXCEL_SAMPLE: B2BEkstreExcelRow[] = [
  { "Tarih": "01.07.2024", "Fiş No": "B2B001", "Fiş Türü": "Satış", "Açıklama": "Temmuz Ayı Malzeme Alımı", "Alacak": 1200.00, "Borç": 0, "Toplam Bakiye": 1200.00, "Fatura No": "INV2024001" },
  { "Tarih": "05.07.2024", "Fiş No": "B2B002", "Fiş Türü": "İade", "Açıklama": "Yanlış Ürün İadesi", "Alacak": 0, "Borç": 150.00, "Toplam Bakiye": 1050.00 },
  { "Tarih": "05.07.2024", "Fiş No": "B2B002", "Fiş Türü": "İade", "Açıklama": "Tekrarlayan Kayıt Testi", "Alacak": 0, "Borç": 150.00, "Toplam Bakiye": 1050.00 }, 
  { "Tarih": "10.07.2024", "Fiş No": "B2B003", "Fiş Türü": "Ödeme", "Açıklama": "Fatura Ödemesi", "Alacak": 0, "Borç": 1200.00, "Toplam Bakiye": -150.00, "Fatura No": "INV2024002" },
];

export const MOCK_DIGER_HARCAMALAR: DigerHarcama[] = [];

export const HarcamaTipiOptions: HarcamaTipi[] = ['Nakit', 'Banka Ödeme', 'Kredi Kartı'];

export const MOCK_STOKLAR: Stok[] = [
    { Stok_ID: 1, Urun_Grubu: 'İçecekler', Malzeme_Kodu: 'ICE001', Malzeme_Aciklamasi: 'Cola 330ml Kutu', Birimi: 'Adet', Sinif: 'Gazlı İçecek', Aktif_Pasif: true },
    { Stok_ID: 2, Urun_Grubu: 'Yiyecekler', Malzeme_Kodu: 'YCK001', Malzeme_Aciklamasi: 'Hamburger Ekmeği', Birimi: 'Adet', Sinif: 'Unlu Mamül', Aktif_Pasif: true },
    { Stok_ID: 3, Urun_Grubu: 'Temizlik', Malzeme_Kodu: 'TMZ001', Malzeme_Aciklamasi: 'Genel Yüzey Temizleyici 1L', Birimi: 'Litre', Sinif: 'Kimyasal', Aktif_Pasif: false },
    { Stok_ID: 4, Urun_Grubu: 'İçecekler', Malzeme_Kodu: 'ICE002', Malzeme_Aciklamasi: 'Su 0.5L Pet', Birimi: 'Adet', Sinif: 'Su', Aktif_Pasif: true },
];

export const MOCK_STOK_FIYATLAR: StokFiyat[] = [
    { Fiyat_ID: 1, Malzeme_Kodu: 'ICE001', Gecerlilik_Baslangic_Tarih: '2024-01-01', Fiyat: 15.00 },
    { Fiyat_ID: 2, Malzeme_Kodu: 'YCK001', Gecerlilik_Baslangic_Tarih: '2024-01-01', Fiyat: 3.50 },
    { Fiyat_ID: 3, Malzeme_Kodu: 'ICE002', Gecerlilik_Baslangic_Tarih: '2023-12-01', Fiyat: 5.00 },
    { Fiyat_ID: 4, Malzeme_Kodu: 'ICE002', Gecerlilik_Baslangic_Tarih: '2024-03-01', Fiyat: 5.50 },
];

export const MOCK_STOK_SAYIMLARI: StokSayim[] = [];

export const MOCK_CALISANLAR: Calisan[] = [
  { TC_No: '11111111111', Adi: 'Ahmet', Soyadi: 'Yılmaz', Net_Maas: 15000.50, Sigorta_Giris: '2023-01-15', Aktif_Pasif: true, Sube_ID: 1, IBAN: 'TR000000000000000000000000' },
  { TC_No: '22222222222', Adi: 'Zeynep', Soyadi: 'Kaya', Net_Maas: 12000.00, Sigorta_Giris: '2022-06-01', Sigorta_Cikis: '2023-12-31', Aktif_Pasif: false, Sube_ID: 1 },
  { TC_No: '33333333333', Adi: 'Mehmet', Soyadi: 'Özdemir', Net_Maas: 18000.75, Sigorta_Giris: '2024-02-01', Aktif_Pasif: true, Sube_ID: 2, IBAN: 'TR111111111111111111111111' },
];

export const MOCK_PUANTAJ_SECIMI: PuantajSecimi[] = [
  { Secim_ID: 1, Secim: 'Tam Gün Çalışma', Degeri: 1.0, Renk_Kodu: '#4CAF50', Aktif_Pasif: true }, 
  { Secim_ID: 2, Secim: 'Yarım Gün Çalışma', Degeri: 0.5, Renk_Kodu: '#FFC107', Aktif_Pasif: true }, 
  { Secim_ID: 3, Secim: 'Hafta Tatili', Degeri: 0.0, Renk_Kodu: '#2196F3', Aktif_Pasif: true }, 
  { Secim_ID: 4, Secim: 'Resmi Tatil', Degeri: 1.0, Renk_Kodu: '#9C27B0', Aktif_Pasif: true }, 
  { Secim_ID: 5, Secim: 'Ücretli İzin', Degeri: 1.0, Renk_Kodu: '#00BCD4', Aktif_Pasif: true }, 
  { Secim_ID: 6, Secim: 'Raporlu', Degeri: 0.0, Renk_Kodu: '#F44336', Aktif_Pasif: true }, 
  { Secim_ID: 7, Secim: 'Ücretsiz İzin', Degeri: 0.0, Renk_Kodu: '#795548', Aktif_Pasif: false }, 
  { Secim_ID: 8, Secim: 'Eksik Gün', Degeri: 0.0, Renk_Kodu: '#FF9800', Aktif_Pasif: true }, 
];

export const MOCK_PUANTAJ_DATA: Puantaj[] = [];
export const MOCK_GELIR_DATA: Gelir[] = [];
export const MOCK_GELIR_EKSTRA_DATA: GelirEkstra[] = [];
export const MOCK_AVANS_DATA: AvansIstek[] = [];

export const STORAGE_KEYS = {
  APP_STATE: 'silvercloud_appState',
  DATA_STATE: 'silvercloud_dataState',
  TOKEN: 'silvercloud_token',
};