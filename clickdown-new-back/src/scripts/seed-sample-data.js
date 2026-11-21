/**
 * Seeds realistic sample data for local development: roles, team users, custom fields,
 * projects, tasks (tasks and bugs), sprints, comments, chats, messages, reactions,
 * attachments, notifications and invitations.
 *
 *   npm run seed:data            add the sample data (skips if it already exists)
 *   npm run seed:data -- --reset wipe the sample collections and seed again
 *
 * Run `npm run seed` first. Never run this against a production database.
 */
import '../controllers/envController';
import crypto from 'crypto';
import mongoose from 'mongoose';
import Role from '../services/role/role.schema';
import User from '../services/user/user.schema';
import Project from '../services/project/project.schema';
import Task from '../services/task/task.schema';
import Sprint from '../services/sprint/sprint.schema';
import CustomField from '../services/customfield/customfield.schema';
import Chat from '../services/chat/chat.schema';
import Message from '../services/message/message.schema';
import Notifications from '../services/notifications/notify.schema';
import NotificationState from '../services/notifications/notifyState.schema';
import Comment from '../services/comment/comment.schema';
import Reaction from '../services/reaction/reaction.schema';
import Attachment from '../services/attachments/attach.schema';
import Invitations from '../services/invitations/invitaions.schema';

const RESET = process.argv.includes('--reset');
const FRONT_URL = process.env.VITE_BASE_URL || 'http://localhost:3001';
const DAY = 24 * 60 * 60 * 1000;
const daysFromNow = (n) => new Date(Date.now() + n * DAY);

const PEOPLE = [
  { role: 'owner', name: 'Olivia Owner', username: 'owner', email: 'owner@workgrid.test', password: 'Owner@12345', jobtitle: 'Product Owner', department: 'management' },
  { role: 'admin', name: 'Adam Admin', username: 'admin', email: 'admin@workgrid.test', password: 'Admin@12345', jobtitle: 'Project Admin', department: 'management' },
  { role: 'member', name: 'Mia Member', username: 'member', email: 'member@workgrid.test', password: 'Member@12345', jobtitle: 'Frontend Developer', department: 'engineering' },
  { role: 'member', name: 'Priya Sharma', username: 'priya', email: 'priya@workgrid.test', password: 'Priya@12345', jobtitle: 'Backend Developer', department: 'engineering' },
  { role: 'member', name: 'Rafi Hasan', username: 'rafi', email: 'rafi@workgrid.test', password: 'Rafi@12345', jobtitle: 'QA Engineer', department: 'quality' },
  { role: 'member', name: 'Nadia Karim', username: 'nadia', email: 'nadia@workgrid.test', password: 'Nadia@12345', jobtitle: 'UI/UX Designer', department: 'design' },
];

const STATUS_OPTIONS = [
  { name: 'Todo', fieldName: 'Todo', background: '#94A3B8' },
  { name: 'In Progress', fieldName: 'In Progress', background: '#4BADE8' },
  { name: 'In Review', fieldName: 'In Review', background: '#FFA726' },
  { name: 'Done', fieldName: 'Done', background: '#22C55E' },
];

async function wipe() {
  await Promise.all([
    Notifications, NotificationState, Reaction, Attachment, Message, Chat, Comment, Invitations,
    Sprint, Task, Project, CustomField,
  ].map((model) => model.deleteMany({})));
  console.log('cleared sample collections');
}

async function ensureRoles() {
  const roles = {};
  for (const name of ['owner', 'admin', 'member']) {
    let role = await Role.findOne({ name });
    if (!role) {
      role = await Role.create({ name, department: name === 'member' ? 'default' : 'management' });
    }
    roles[name] = role;
  }
  if (process.env.DEFAULT_ROLE !== roles.member.id) {
    console.warn(`WARNING: DEFAULT_ROLE should be ${roles.member.id} (member role)`);
  }
  return roles;
}

async function ensurePeople(roles) {
  const users = {};
  for (const person of PEOPLE) {
    let user = await User.findOne({ email: person.email });
    if (!user) {
      user = await User.create({
        name: person.name,
        username: person.username,
        email: person.email,
        password: person.password,
        jobtitle: person.jobtitle,
        department: person.department,
        role: roles[person.role].id,
        company: 'Workgrid Demo',
      });
      console.log(`user  ${person.email}`);
    }
    users[person.username] = user;
  }
  return users;
}

async function createCustomFields() {
  const status = await CustomField.create({ name: 'Status', type: 'dropdown', value: STATUS_OPTIONS, default: true, description: 'Where the task is in its workflow' });
  const points = await CustomField.create({ name: 'Story points', type: 'number', default: true, description: 'Relative size of the task' });
  const due = await CustomField.create({ name: 'Due date', type: 'date', default: true, description: 'When the task should be finished' });
  return { status, points, due };
}

/** Creates a task document. `status` and `points` are stored as custom field values too, like the UI does. */
async function makeTask(project, cf, t) {
  return Task.create({
    project: project.id,
    name: t.name,
    description: t.description,
    type: t.type,
    priority: t.priority,
    estimate: t.estimate,
    points: t.points,
    assignee: t.assignees,
    startDate: t.start,
    endDate: t.end,
    customFields: [
      { cf: cf.status.id, value: t.status },
      { cf: cf.points.id, value: t.points },
      ...(t.end ? [{ cf: cf.due.id, value: t.end }] : []),
    ],
  });
}

async function createProject({ name, owner, members, sprintLength, cf, users, tasks, bugs, sprints }) {
  const project = await Project.create({
    name,
    owner: owner.id,
    sprintLength,
    members: members.map((m) => m.id),
    favorit: [owner.id],
    customFields: [cf.status, cf.points, cf.due].map((field) => ({ show: true, cf: field.id })),
  });

  const chat = await Chat.create({
    name,
    creator: owner.id,
    description: `Team chat for ${name}`,
    members: members.map((m) => m.id),
    icon: project.icon,
  });
  project.chat = chat.id;

  const taskDocs = [];
  for (const t of tasks) taskDocs.push(await makeTask(project, cf, { ...t, assignees: t.assignees.map((u) => users[u].id) }));
  const bugDocs = [];
  for (const b of bugs) bugDocs.push(await makeTask(project, cf, { ...b, assignees: b.assignees.map((u) => users[u].id) }));

  // Parent/child example: the first epic owns the first two sub tasks.
  const epic = taskDocs.find((t) => t.type === 'Epic');
  if (epic) {
    const kids = taskDocs.filter((t) => t.type === 'Sub task').slice(0, 2);
    epic.child = kids.map((k) => k.id);
    await epic.save();
  }

  const sprintDocs = [];
  for (const s of sprints) {
    const sprintTasks = s.taskIndexes.map((i) => taskDocs[i]).filter(Boolean);
    sprintDocs.push(await Sprint.create({
      title: s.title,
      status: s.status,
      startDate: daysFromNow(s.startInDays),
      endDate: daysFromNow(s.endInDays),
      tasks: sprintTasks.map((t) => t.id),
    }));
  }

  project.tasks = taskDocs.map((t) => t.id);
  project.bugs = bugDocs.map((t) => t.id);
  project.sprints = sprintDocs.map((s) => s.id);
  await project.save();
  return { project, chat, taskDocs, bugDocs };
}

async function seedActivity(project, owner, users, taskDocs, bugDocs) {
  const all = [...taskDocs, ...bugDocs];
  const logs = all.slice(0, 6).map((task, i) => ({
    typeField: 'task',
    area: 'Task',
    action: 'create',
    message: `${users.owner.name} created "${task.name}"`,
    user: owner.id,
    task: task.id,
    chat: project.chat,
    members: project.members,
    curValue: { name: task.name, status: task.customFields[0].value },
    comment: `activity ${i + 1}`,
  }));
  await Notifications.insertMany(logs);

  const comments = [
    { task: all[0], author: users.priya, description: 'I have a fix for this in a draft branch. Will open the PR today.' },
    { task: all[0], author: users.rafi, description: 'Reproduced on Safari 17 and iOS 17. Adding a test case.' },
    { task: all[2], author: users.nadia, description: 'Final copy is approved. Ready to close once the build is out.' },
  ].filter((c) => c.task);
  for (const c of comments) {
    await Comment.create({ task: c.task.id, author: c.author.id, description: c.description, created: new Date() });
  }
}

async function seedChats(users, reactions) {
  // reactions: [[user, emoji, name], ...]
  const dm = await Chat.create({
    creator: users.owner.id,
    members: [users.owner.id, users.admin.id],
  });
  const team = await Chat.create({
    name: 'Design & QA',
    description: 'Cross-team chat for design and quality',
    creator: users.nadia.id,
    members: [users.nadia.id, users.rafi.id, users.priya.id, users.admin.id],
  });

  const attachment = await Attachment.create({ chat: team.id, location: 'images/project.svg', type: 'image' });

  const dmLines = [
    [users.owner, 'Can we move the Mobile launch to next Monday?'],
    [users.admin, 'Yes, if the crash fix lands by Thursday.'],
    [users.owner, 'Great, I will tell the client.'],
  ];
  const teamLines = [
    [users.nadia, 'Here is the new hero layout for review.', [attachment.id]],
    [users.rafi, 'Looks clean. The CTA contrast on mobile is a bit low.'],
    [users.priya, 'I can adjust the spacing in the API response once design is final.'],
    [users.nadia, 'Thanks, I will bump the contrast and send a new version.'],
  ];

  let dmLast = null;
  for (const [author, text] of dmLines) {
    dmLast = await Message.create({ author: author.id, message: text, chat: dm.id, type: 'string', read_by: [author.id] });
  }
  let teamLast = null;
  for (const [author, text, files] of teamLines) {
    teamLast = await Message.create({
      author: author.id, message: text, chat: team.id, type: 'string', read_by: [author.id], attachments: files || [],
    });
  }
  // Reactions on the last team message: one document per (message, user, emoji).
  const reactionDocs = await Reaction.create(reactions.map(([user, emoji, name]) => ({ message: teamLast.id, user: user.id, emoji, name })));
  teamLast.reactions = reactionDocs.map((r) => r.id);
  await teamLast.save();
  dm.lastMessage = dmLast.id;
  await dm.save();
  team.lastMessage = teamLast.id;
  await team.save();
  return { dm, team };
}

async function seedInvitations(project) {
  await Invitations.create({
    email: 'newhire@workgrid.test',
    access: 'member',
    projects: [project.id],
    link: `${FRONT_URL}/invite/${crypto.randomBytes(16).toString('hex')}`,
    status: 'pending',
  });
  await Invitations.create({
    email: 'contractor@workgrid.test',
    access: 'member',
    projects: [],
    link: `${FRONT_URL}/invite/${crypto.randomBytes(16).toString('hex')}`,
    status: 'accepted',
  });
}

async function run() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Refusing to seed sample data when NODE_ENV=production');
  }
  await mongoose.connect(process.env.MONGODB_URL);

  if (RESET) await wipe();
  else if (await Project.exists({ name: 'Website Redesign' })) {
    console.log('Sample data already exists. Run with --reset to rebuild it.');
    await mongoose.disconnect();
    return;
  }

  const roles = await ensureRoles();
  const users = await ensurePeople(roles);
  const cf = await createCustomFields();
  const reactions = [
    [users.rafi, '👍', 'thumbs_up'],
    [users.admin, '👍', 'thumbs_up'],
    [users.priya, '🎉', 'party'],
  ];

  const website = await createProject({
    name: 'Website Redesign',
    owner: users.owner,
    members: Object.values(users),
    sprintLength: 14,
    cf,
    users,
    tasks: [
      { name: 'Design new landing hero', description: 'Hero section with a clear call to action.', type: 'Task', priority: 'Usual', status: 'In Progress', estimate: '1d', points: 8, assignees: ['nadia'], start: daysFromNow(-5), end: daysFromNow(3) },
      { name: 'Set up analytics events', description: 'Track sign-up, project creation and checkout.', type: 'Task', priority: 'Normal', status: 'Todo', estimate: '6h', points: 3, assignees: ['rafi'], start: daysFromNow(0), end: daysFromNow(4) },
      { name: 'Write copy for About page', description: 'Short, friendly copy for the team section.', type: 'Task', priority: 'Normal', status: 'Done', estimate: '4h', points: 2, assignees: ['admin'], start: daysFromNow(-10), end: daysFromNow(-6) },
      { name: 'Responsive navigation menu', description: 'Collapsible menu for phones and tablets.', type: 'Task', priority: 'Immediate', status: 'In Review', estimate: '1d', points: 5, assignees: ['priya', 'member'], start: daysFromNow(-2), end: daysFromNow(1) },
      { name: 'Accessibility audit', description: 'WCAG 2.2 AA check on all public pages.', type: 'Task', priority: 'Normal', status: 'Todo', estimate: '2d', points: 8, assignees: ['rafi'], start: daysFromNow(4), end: daysFromNow(10) },
      { name: 'Checkout flow', description: 'Epic covering the full checkout journey.', type: 'Epic', priority: 'Immediate', status: 'In Progress', estimate: '5d', points: 13, assignees: ['priya'], start: daysFromNow(-3), end: daysFromNow(12) },
      { name: 'Address form validation', description: 'Inline validation for the shipping form.', type: 'Sub task', priority: 'Usual', status: 'In Progress', estimate: '3h', points: 2, assignees: ['priya'], start: daysFromNow(-3), end: daysFromNow(0) },
      { name: 'Payment error messages', description: 'Friendly messages for declined cards.', type: 'Sub task', priority: 'Usual', status: 'Todo', estimate: '2h', points: 2, assignees: ['priya'], start: daysFromNow(1), end: daysFromNow(3) },
    ],
    bugs: [
      { name: 'Login button unresponsive on Safari', description: 'Tapping the button does nothing on Safari 17.', type: 'Bug', priority: 'Immediate', status: 'In Progress', estimate: '3h', points: 3, assignees: ['admin'], start: daysFromNow(-1), end: daysFromNow(1) },
      { name: 'Sidebar collapses incorrectly on tablet', description: 'Sidebar overlaps content between 768px and 1024px.', type: 'Bug', priority: 'Usual', status: 'Todo', estimate: '2h', points: 2, assignees: ['rafi'], start: daysFromNow(0), end: daysFromNow(2) },
      { name: 'Typo in pricing page footer', description: '"Recieve" should be "Receive".', type: 'Bug', priority: 'Normal', status: 'Done', estimate: '15m', points: 1, assignees: ['nadia'], start: daysFromNow(-4), end: daysFromNow(-3) },
      { name: 'Images not loading on slow network', description: 'No placeholder while images load on 3G.', type: 'Bug', priority: 'Tomorrow', status: 'In Review', estimate: '4h', points: 5, assignees: ['priya'], start: daysFromNow(-2), end: daysFromNow(2) },
      { name: 'Session expires too early', description: 'Users are logged out after 10 minutes of activity.', type: 'Bug', priority: 'Urgent', status: 'Todo', estimate: '2h30m', points: 3, assignees: ['priya'], start: daysFromNow(0), end: daysFromNow(1) },
    ],
    sprints: [
      { title: 'Sprint 1', status: 'done', startInDays: -21, endInDays: -7, taskIndexes: [2] },
      { title: 'Sprint 2', status: 'onGoing', startInDays: -7, endInDays: 7, taskIndexes: [0, 1, 3, 5] },
    ],
  });

  const mobile = await createProject({
    name: 'Mobile App Launch',
    owner: users.owner,
    members: [users.owner, users.admin, users.priya, users.nadia],
    sprintLength: 7,
    cf,
    users,
    tasks: [
      { name: 'Onboarding screens', description: 'Three screens shown on first launch.', type: 'Task', priority: 'Usual', status: 'In Progress', estimate: '2d', points: 5, assignees: ['nadia'], start: daysFromNow(-2), end: daysFromNow(3) },
      { name: 'Push notification setup', description: 'Configure web and mobile push.', type: 'Task', priority: 'Immediate', status: 'Todo', estimate: '1d', points: 3, assignees: ['priya'], start: daysFromNow(0), end: daysFromNow(2) },
      { name: 'App icon and splash screen', description: 'Final icon in all required sizes.', type: 'Task', priority: 'Normal', status: 'Done', estimate: '3h', points: 1, assignees: ['nadia'], start: daysFromNow(-6), end: daysFromNow(-5) },
      { name: 'Release checklist', description: 'App store and Play Store checklist.', type: 'Task', priority: 'Normal', status: 'Todo', estimate: '1h', points: 1, assignees: ['admin'], start: daysFromNow(5), end: daysFromNow(6) },
    ],
    bugs: [
      { name: 'Crash on cold start (Android 14)', description: 'App crashes when opened after a force close.', type: 'Bug', priority: 'Urgent', status: 'In Progress', estimate: '5h', points: 8, assignees: ['priya'], start: daysFromNow(-1), end: daysFromNow(1) },
      { name: 'Keyboard covers the chat input', description: 'The keyboard hides the message box on iOS.', type: 'Bug', priority: 'Tomorrow', status: 'Todo', estimate: '1h30m', points: 2, assignees: ['priya'], start: daysFromNow(1), end: daysFromNow(3) },
    ],
    sprints: [
      { title: 'Sprint 1', status: 'onGoing', startInDays: -3, endInDays: 4, taskIndexes: [0, 2] },
    ],
  });

  await seedActivity(website.project, users.owner, users, website.taskDocs, website.bugDocs);
  await seedActivity(mobile.project, users.owner, users, mobile.taskDocs, mobile.bugDocs);
  await seedChats(users, reactions);
  await seedInvitations(website.project);

  console.log('\nSample data ready:');
  console.log('  projects      2 (Website Redesign, Mobile App Launch)');
  console.log(`  tasks         ${website.taskDocs.length + mobile.taskDocs.length}`);
  console.log(`  bugs          ${website.bugDocs.length + mobile.bugDocs.length}`);
  console.log('  sprints       3');
  console.log('  custom fields 3 (Status, Story points, Due date)');
  console.log('  chats         4 (2 project chats, 1 direct, 1 group)');
  console.log('  messages      7, comments 6, reactions 3, attachments 1');
  console.log('  invitations   2, notifications 12');
  console.log('\nSign in with any demo account (see the sign-in page or README).');
  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error('Seeding sample data failed:', error);
  await mongoose.disconnect();
  process.exit(1);
});
