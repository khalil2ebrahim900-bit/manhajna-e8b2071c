<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Student entry is a local learning profile, not authenticated identity; never use it to authorize staff or private database access.
- Lesson search indexes the existing browser-safe curriculum; favorites and explicit completion are stored per local student ID, because students do not have authenticated accounts.
- Shared navigation and footer use AppHeader/AppFooter; semantic theme tokens and shared CSS layout classes provide consistent responsive presentation.
