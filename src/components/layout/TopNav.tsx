 "use client";

 import Link from "next/link";
 import {
   SignedIn,
   SignedOut,
   SignInButton,
   SignOutButton,
   UserButton,
 } from "@clerk/nextjs";
 import { useCurrentUser } from "@/hooks/useCurrentUser";
 import { useCurrentRole } from "@/hooks/useCurrentRole";
 import { isAdmin } from "@/lib/roles";

 export default function TopNav(): React.ReactElement {
   const user = useCurrentUser();
   const role = useCurrentRole();
   const displayName = user?.displayName ?? null;
   const showAdminBadge = isAdmin(role);

   return (
     <header className="sticky top-0 z-10 h-16 border-b border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-950/80">
       <div className="mx-auto flex h-full max-w-5xl items-center justify-between px-4 md:px-8">
         <Link
           href="/"
           className="min-w-[120px] text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50"
           style={{
             background: "linear-gradient(90deg, #6366f1, #a855f7)",
             WebkitBackgroundClip: "text",
             WebkitTextFillColor: "transparent",
             backgroundClip: "text",
           }}
         >
           HypeShelf
         </Link>
         <nav
           className="flex items-center gap-3"
           aria-label="Primary navigation"
         >
           <SignedOut>
             <SignInButton mode="modal">
               <button
                 type="button"
                 className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-slate-300 dark:hover:bg-slate-800 dark:focus-visible:ring-offset-slate-950"
               >
                 Sign in
               </button>
             </SignInButton>
           </SignedOut>
           <SignedIn>
             <Link
               href="/dashboard"
               className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-slate-300 dark:hover:bg-slate-800 dark:focus-visible:ring-offset-slate-950"
             >
               Go to your shelf
             </Link>
             {displayName && (
               <span className="text-sm text-slate-700 dark:text-slate-300">
                 {displayName}
               </span>
             )}
             {showAdminBadge && (
               <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                 Admin
               </span>
             )}
             <SignOutButton redirectUrl="/">
               <button
                 type="button"
                 className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-slate-300 dark:hover:bg-slate-800 dark:focus-visible:ring-offset-slate-950"
               >
                 Sign out
               </button>
             </SignOutButton>
             <UserButton
               afterSignOutUrl="/"
               appearance={{
                 elements: {
                   avatarBox: "h-8 w-8",
                 },
               }}
             />
           </SignedIn>
         </nav>
       </div>
     </header>
   );
 }

