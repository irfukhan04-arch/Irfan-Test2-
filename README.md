# TaskFlow — Task Manager

A clean, responsive task manager built with Next.js, React, and TypeScript. It is ready for GitHub and Vercel.

## Features
- Create, edit, and delete tasks
- Start dates, due dates, priority, and status
- Progress percentage and update notes
- Dashboard metrics and upcoming deadlines
- Search and status filtering
- Timeline view
- Browser localStorage persistence

## Run locally
1. Install Node.js 20.9 or newer.
2. Extract this ZIP and open the project folder in a terminal.
3. Run `npm install`.
4. Run `npm run dev`.
5. Open http://localhost:3000.

## Deploy with GitHub + Vercel
1. Create a new GitHub repository.
2. Upload/push the contents of this folder to the repository root.
3. In Vercel, choose **Add New → Project** and import the GitHub repository.
4. Keep the framework preset as **Next.js** and click **Deploy**.

No environment variables or database setup are required for this starter version.

## Important storage note
This version stores tasks in the browser's localStorage. That means tasks persist on the same browser/device, but they do not automatically sync across devices or users. For cloud sync, authentication, and shared access, connect a database such as Supabase or Neon in a next iteration.
