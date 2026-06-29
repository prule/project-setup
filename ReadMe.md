# The Engineering Playbook

Welcome to our Engineering Playbook! 

This repository contains our comprehensive documentation for architecture choices, tooling, testing, and deployment strategies.

## 📖 Read the Book
The playbook is automatically generated into a beautiful, searchable site using MkDocs.

**[👉 View the Engineering Playbook Online](https://prule.github.io/project-setup/)**

## 🛠️ Running Locally
If you are contributing to the playbook and want to preview your changes locally before committing:

1. Install MkDocs and the Material theme (requires Python):
   ```bash
   pip install mkdocs-material
   ```
2. Start the local server:
   ```bash
   mkdocs serve
   ```
3. Open `http://127.0.0.1:8000` in your browser.

## 🤖 AI Skills Installation

This repository isn't just a playbook of rules for human engineers to follow. It is an **Installable AI Plugin**. It contains custom AI skills that force your AI coding assistant to generate code adhering strictly to these playbook standards (e.g., using Hexagonal Architecture, HATEOAS, Expand and Contract migrations, etc.).

For a full list of the 11 available skills, see the [AI Skills Hub](https://prule.github.io/project-setup/AISkills/).

### 🚀 1-Click Installation (For Any Local AI)
To install these AI skills locally into any project, simply navigate to your project directory and run:

```bash
npx github:prule/project-setup init
```

This will instantly copy the Playbook's AI instructions into your project's `.agents/skills` folder. Because these are now local files, your AI assistant will immediately adhere to our standards, and the rules will be committed to version control for the rest of your team to use!

### Installing in Claude (Claude Projects)
To use these playbook skills with Anthropic's web-based Claude:
1. Create a new **Project** in the Claude web interface.
2. Under **Project Knowledge**, upload the `SKILL.md` files from the `skills/` directory of this repository.
3. In the **Custom Instructions** for the project, add the following directive:
   > "When asked to perform a task matching one of the skills in the Project Knowledge, please read the corresponding SKILL.md file and follow its instructions exactly before writing any code."
4. You can now chat in your project, and Claude will reference our company's playbook rules when prompted!
