#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const command = process.argv[2];

if (command !== 'init') {
  console.log('Usage: npx github:prule/project-setup init');
  process.exit(1);
}

const sourceSkillsDir = path.join(__dirname, '..', 'skills');
// Claude Code only discovers skills in .claude/skills (project) and
// ~/.claude/skills (personal). Anywhere else and they are silently ignored.
const targetClaudeDir = path.join(process.cwd(), '.claude');
const targetSkillsDir = path.join(targetClaudeDir, 'skills');

console.log('🤖 Installing VSSW Engineering Playbook AI Skills...\n');

try {
  if (!fs.existsSync(targetSkillsDir)) {
    fs.mkdirSync(targetSkillsDir, { recursive: true });
  }

  // Check if source skills exist
  if (!fs.existsSync(sourceSkillsDir)) {
    console.error('❌ Error: Could not find skills directory in the package.');
    process.exit(1);
  }

  // Copy all contents from source to target
  fs.cpSync(sourceSkillsDir, targetSkillsDir, { recursive: true });

  console.log(`✅ Successfully installed skills into: ${targetSkillsDir}`);

  // Point non-Claude agents at the same single copy of the skills, rather than
  // duplicating the tree into a second directory that would drift.
  writeAgentsPointer();

  console.log('\nYour AI assistant is now equipped with the VSSW engineering standards!');
  console.log('Restart Claude Code (or run /skills) to pick them up.');
  console.log('Make sure to commit the .claude directory and AGENTS.md to your repository.');

} catch (error) {
  console.error('❌ Error installing skills:', error.message);
  process.exit(1);
}

function writeAgentsPointer() {
  const agentsFile = path.join(process.cwd(), 'AGENTS.md');
  const marker = '<!-- vssw-playbook:skills -->';
  const section = [
    marker,
    '## VSSW Engineering Playbook Skills',
    '',
    'This project follows the [VSSW Engineering Playbook](https://prule.github.io/project-setup/).',
    'Its skills are installed in `.claude/skills/`, one directory per skill, each with a',
    '`SKILL.md` describing when to use it and the standard it enforces.',
    '',
    'Claude Code discovers them automatically. **If you are a different agent, read the',
    '`SKILL.md` files in `.claude/skills/` and follow the matching one before writing code.**',
    'Do not copy them elsewhere — that directory is the single source of truth.',
    '<!-- /vssw-playbook:skills -->',
    '',
  ].join('\n');

  if (!fs.existsSync(agentsFile)) {
    fs.writeFileSync(agentsFile, `# Agent Instructions\n\n${section}`);
    console.log('✅ Created AGENTS.md pointing other agents at .claude/skills');
    return;
  }

  const existing = fs.readFileSync(agentsFile, 'utf8');
  if (existing.includes(marker)) {
    console.log('ℹ️  AGENTS.md already references the playbook skills — left unchanged.');
    return;
  }

  const separator = existing.endsWith('\n') ? '\n' : '\n\n';
  fs.appendFileSync(agentsFile, `${separator}${section}`);
  console.log('✅ Appended the playbook skills section to your existing AGENTS.md');
}
