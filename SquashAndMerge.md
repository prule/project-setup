# Understanding Squash and Merge

"Squash and merge" is our preferred technique when bringing changes from a feature branch into the `main` branch. 

To understand why it's so useful, let's look at what usually happens when you work on a feature branch. You might make several small, messy commits as you work:
1. `wip: start login page`
2. `fix: typo in css`
3. `feat: add api call for login`
4. `fix: actually make the api call work`
5. `chore: cleanup comments`

## What happens in a Standard Merge?
If you do a standard merge, **all 5 of those individual commits** get brought into the `main` branch, along with an extra "Merge commit." 
Over time, as multiple developers merge their branches, the `main` branch's history becomes a tangled web of hundreds of tiny, context-less commits like "fix typo." If you ever need to figure out when a specific feature was introduced, it's very difficult to read through the log.

## What happens in a Squash and Merge?
When you "squash and merge," Git takes all 5 of those commits from your feature branch, squashes them together into **one single, unified commit**, and places that one commit onto the `main` branch.

You would typically name this squashed commit something clear and standardized (e.g., `feat(auth): implement user login page`), adhering to our Conventional Commits guideline.

## Why is this better?

1. **Clean History:** Your `main` branch history reads like a high-level changelog:
   - `feat(auth): implement user login page`
   - `fix(ui): resolve header alignment on mobile`
   - `feat(api): add pagination to users endpoint`
2. **Linear History:** There are no messy, criss-crossing "merge commits" linking branches together. It's just a straight line of fully-completed features.
3. **Easy Reverts:** If the new login page breaks production, you only have to revert **one single commit**. If you had done a standard merge, trying to cleanly revert a feature composed of 5 scattered commits can be a nightmare.

In short: you get to keep your messy, granular commits while you work on your own branch, but the `main` branch stays pristine and professional!
