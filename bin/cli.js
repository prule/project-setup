#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const command = process.argv[2];

if (command !== 'init') {
  console.log('Usage: npx github:prule/project-setup init');
  process.exit(1);
}

const sourceSkillsDir = path.join(__dirname, '..', 'skills');
const targetAgentsDir = path.join(process.cwd(), '.agents');
const targetSkillsDir = path.join(targetAgentsDir, 'skills');

console.log('🤖 Installing VSSW Engineering Playbook AI Skills...\n');

try {
  // Create .agents/skills directory if it doesn't exist
  if (!fs.existsSync(targetAgentsDir)) {
    fs.mkdirSync(targetAgentsDir, { recursive: true });
  }
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
  console.log('\nYour AI assistant is now equipped with the VSSW engineering standards!');
  console.log('Make sure to commit the .agents directory to your repository.');

} catch (error) {
  console.error('❌ Error installing skills:', error.message);
  process.exit(1);
}
