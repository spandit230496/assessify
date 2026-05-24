import { PrismaClient, Role, QuestionType, Difficulty } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create users
  const passwordHash = await bcrypt.hash('Admin@123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@assessify.com' },
    update: {},
    create: {
      email: 'admin@assessify.com',
      passwordHash,
      firstName: 'Super',
      lastName: 'Admin',
      role: Role.SUPER_ADMIN,
      isEmailVerified: true,
    },
  });

  const recruiter = await prisma.user.upsert({
    where: { email: 'recruiter@assessify.com' },
    update: {},
    create: {
      email: 'recruiter@assessify.com',
      passwordHash,
      firstName: 'Jane',
      lastName: 'Recruiter',
      role: Role.RECRUITER,
      isEmailVerified: true,
    },
  });

  const candidate = await prisma.user.upsert({
    where: { email: 'candidate@assessify.com' },
    update: {},
    create: {
      email: 'candidate@assessify.com',
      passwordHash,
      firstName: 'John',
      lastName: 'Candidate',
      role: Role.CANDIDATE,
      isEmailVerified: true,
    },
  });

  const proctor = await prisma.user.upsert({
    where: { email: 'proctor@assessify.com' },
    update: {},
    create: {
      email: 'proctor@assessify.com',
      passwordHash,
      firstName: 'Sam',
      lastName: 'Proctor',
      role: Role.PROCTOR,
      isEmailVerified: true,
    },
  });

  // Create assessment
  const assessment = await prisma.assessment.create({
    data: {
      title: 'Frontend Developer Assessment',
      description:
        'Comprehensive assessment for Frontend Developer candidates covering HTML, CSS, JavaScript, and React.',
      instructions:
        'Please read each question carefully. You have 60 minutes to complete this assessment.',
      totalDuration: 60,
      totalMarks: 100,
      passingPercentage: 60,
      randomizeQuestions: true,
      randomizeOptions: true,
      autoSubmit: true,
      fullscreenRequired: true,
      webcamRequired: true,
      tags: ['frontend', 'javascript', 'react'],
      status: 'PUBLISHED',
      createdById: recruiter.id,
      sections: {
        create: [
          {
            title: 'HTML & CSS',
            description: 'Test your HTML and CSS knowledge',
            order: 0,
            totalMarks: 30,
            questions: {
              create: [
                {
                  type: QuestionType.MCQ,
                  difficulty: Difficulty.EASY,
                  title: 'HTML Semantic Elements',
                  body: 'Which HTML5 element is used to define navigation links?',
                  marks: 5,
                  order: 0,
                  tags: ['html', 'semantic'],
                  options: {
                    create: [
                      { text: '<navigation>', isCorrect: false, order: 0 },
                      { text: '<nav>', isCorrect: true, order: 1 },
                      { text: '<navigate>', isCorrect: false, order: 2 },
                      { text: '<navbar>', isCorrect: false, order: 3 },
                    ],
                  },
                },
                {
                  type: QuestionType.MCQ,
                  difficulty: Difficulty.MEDIUM,
                  title: 'CSS Flexbox',
                  body: 'Which CSS property is used to align items along the cross axis in a flex container?',
                  marks: 5,
                  order: 1,
                  tags: ['css', 'flexbox'],
                  options: {
                    create: [
                      { text: 'justify-content', isCorrect: false, order: 0 },
                      { text: 'align-items', isCorrect: true, order: 1 },
                      { text: 'flex-direction', isCorrect: false, order: 2 },
                      { text: 'flex-wrap', isCorrect: false, order: 3 },
                    ],
                  },
                },
                {
                  type: QuestionType.TRUE_FALSE,
                  difficulty: Difficulty.EASY,
                  title: 'CSS Box Model',
                  body: 'In the CSS box model, padding is the space between the content and the border.',
                  marks: 5,
                  order: 2,
                  tags: ['css', 'box-model'],
                  options: {
                    create: [
                      { text: 'True', isCorrect: true, order: 0 },
                      { text: 'False', isCorrect: false, order: 1 },
                    ],
                  },
                },
              ],
            },
          },
          {
            title: 'JavaScript',
            description: 'Test your JavaScript fundamentals',
            order: 1,
            totalMarks: 40,
            questions: {
              create: [
                {
                  type: QuestionType.MCQ,
                  difficulty: Difficulty.MEDIUM,
                  title: 'JavaScript Closures',
                  body: 'What will be the output of the following code?\n\n```javascript\nfunction outer() {\n  let count = 0;\n  return function() {\n    return ++count;\n  };\n}\nconst fn = outer();\nconsole.log(fn(), fn(), fn());\n```',
                  marks: 10,
                  order: 0,
                  tags: ['javascript', 'closures'],
                  options: {
                    create: [
                      { text: '1 1 1', isCorrect: false, order: 0 },
                      { text: '1 2 3', isCorrect: true, order: 1 },
                      { text: '0 1 2', isCorrect: false, order: 2 },
                      { text: 'undefined undefined undefined', isCorrect: false, order: 3 },
                    ],
                  },
                },
                {
                  type: QuestionType.CODING,
                  difficulty: Difficulty.MEDIUM,
                  title: 'Two Sum',
                  body: 'Write a function `twoSum(nums, target)` that returns indices of two numbers that add up to the target.\n\n**Example:**\n```\nInput: nums = [2, 7, 11, 15], target = 9\nOutput: [0, 1]\n```',
                  marks: 20,
                  order: 1,
                  tags: ['javascript', 'algorithms'],
                  codingConfig: {
                    create: {
                      languages: ['javascript', 'python', 'java', 'cpp'],
                      boilerplateCode: {
                        javascript:
                          'function twoSum(nums, target) {\n  // Write your code here\n}',
                        python:
                          'def two_sum(nums, target):\n    # Write your code here\n    pass',
                      },
                      timeLimitMs: 5000,
                      memoryLimitMb: 256,
                    },
                  },
                  testCases: {
                    create: [
                      {
                        input: '2 7 11 15\n9',
                        expected: '0 1',
                        isHidden: false,
                        order: 0,
                      },
                      {
                        input: '3 2 4\n6',
                        expected: '1 2',
                        isHidden: false,
                        order: 1,
                      },
                      {
                        input: '3 3\n6',
                        expected: '0 1',
                        isHidden: true,
                        order: 2,
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            title: 'React',
            description: 'Test your React knowledge',
            order: 2,
            totalMarks: 30,
            questions: {
              create: [
                {
                  type: QuestionType.MSQ,
                  difficulty: Difficulty.MEDIUM,
                  title: 'React Hooks',
                  body: 'Which of the following are valid React hooks? (Select all that apply)',
                  marks: 10,
                  order: 0,
                  tags: ['react', 'hooks'],
                  options: {
                    create: [
                      { text: 'useState', isCorrect: true, order: 0 },
                      { text: 'useEffect', isCorrect: true, order: 1 },
                      { text: 'useClass', isCorrect: false, order: 2 },
                      { text: 'useMemo', isCorrect: true, order: 3 },
                      { text: 'useRender', isCorrect: false, order: 4 },
                    ],
                  },
                },
                {
                  type: QuestionType.FILL_BLANK,
                  difficulty: Difficulty.EASY,
                  title: 'React Virtual DOM',
                  body: 'React uses a _______ to efficiently update the real DOM by comparing changes.',
                  explanation: 'React uses a Virtual DOM to optimize rendering.',
                  marks: 5,
                  order: 1,
                  tags: ['react', 'dom'],
                  metadata: { answer: 'Virtual DOM' },
                },
              ],
            },
          },
        ],
      },
    },
  });

  // Create invitation
  await prisma.candidateInvitation.create({
    data: {
      assessmentId: assessment.id,
      userId: candidate.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'PENDING',
    },
  });

  // Create RBAC permissions
  const permissions = [
    { role: Role.SUPER_ADMIN, resource: 'users', action: 'manage' },
    { role: Role.SUPER_ADMIN, resource: 'assessments', action: 'manage' },
    { role: Role.SUPER_ADMIN, resource: 'analytics', action: 'read' },
    { role: Role.RECRUITER, resource: 'assessments', action: 'create' },
    { role: Role.RECRUITER, resource: 'assessments', action: 'read' },
    { role: Role.RECRUITER, resource: 'assessments', action: 'update' },
    { role: Role.RECRUITER, resource: 'candidates', action: 'invite' },
    { role: Role.RECRUITER, resource: 'analytics', action: 'read' },
    { role: Role.INTERVIEWER, resource: 'assessments', action: 'read' },
    { role: Role.INTERVIEWER, resource: 'questions', action: 'create' },
    { role: Role.CANDIDATE, resource: 'assessments', action: 'attempt' },
    { role: Role.PROCTOR, resource: 'proctoring', action: 'monitor' },
    { role: Role.PROCTOR, resource: 'violations', action: 'read' },
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: {
        role_resource_action: {
          role: perm.role,
          resource: perm.resource,
          action: perm.action,
        },
      },
      update: {},
      create: perm,
    });
  }

  console.log('Seed data created successfully');
  console.log('Users:', { admin: admin.email, recruiter: recruiter.email, candidate: candidate.email, proctor: proctor.email });
  console.log('Default password for all users: Admin@123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
