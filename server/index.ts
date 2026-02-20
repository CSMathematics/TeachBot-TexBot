import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
    console.error('❌ Error: DATABASE_URL is missing from .env or not loaded.');
    process.exit(1);
}

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

console.log('✅ Connected to DB at:', connectionString.split('@')[1] || 'Unknown Host'); // Log host only for security
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// --- Seed Default User (for dev) ---
async function ensureDefaultUser() {
    const count = await prisma.user.count();
    if (count === 0) {
        console.log('🌱 Seeding default user...');
        await prisma.user.create({
            data: {
                id: 'user_1', // Force ID for simplicity in dev
                email: 'teacher@edutex.gr',
                name: 'Default Teacher',
                role: 'TEACHER'
            }
        });
        console.log('✅ Default user created: user_1');
    }
}
ensureDefaultUser();

// --- Syllabus Endpoints ---

// Get default user (for dev auth)
app.get('/api/user/default', async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: 'user_1' } });
    if (!user) return res.status(404).json({ error: 'Default user not found' });
    res.json(user);
});

// Create a new Syllabus
app.post('/api/syllabus', async (req, res) => {
    try {
        const { name, type, ownerId, gradeLevel } = req.body;

        // Validate input
        if (!name || !type || !ownerId) {
            return res.status(400).json({ error: 'Missing required fields: name, type, ownerId' });
        }

        const syllabus = await prisma.syllabus.create({
            data: {
                name,
                type, // 'PERSONAL' | 'ORGANIZATION' | 'SYSTEM'
                ownerId, // For now, we trust the ID. Auth middleware should verify this.
                gradeLevel: gradeLevel || null,
                isPublic: type === 'SYSTEM' || type === 'ORGANIZATION', // Default public for shared types
            },
        });

        res.status(201).json(syllabus);
    } catch (error) {
        console.error('Error creating syllabus:', error);
        res.status(500).json({ error: 'Failed to create syllabus' });
    }
});

// Get all Syllabuses for an owner (or specific ID)
app.get('/api/syllabus', async (req, res) => {
    try {
        const { ownerId } = req.query;

        const whereClause: any = {};
        if (ownerId) {
            whereClause.ownerId = String(ownerId);
        } else {
            // Default to showing System and Public ones if no owner specified?
            // For now, let's just return everything for testing
        }

        const syllabuses = await prisma.syllabus.findMany({
            where: whereClause,
            include: {
                nodes: {
                    where: { parentId: null }, // Only root nodes (Fields) initially? Or just metadata?
                    orderBy: { orderIndex: 'asc' }
                }
            }
        });
        res.json(syllabuses);
    } catch (error) {
        console.error('Error fetching syllabuses:', error);
        res.status(500).json({ error: 'Failed to fetch syllabuses' });
    }
});

// Update Syllabus (Rename, Type)
app.put('/api/syllabus/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, type, description, gradeLevel } = req.body;

        const syllabus = await prisma.syllabus.update({
            where: { id },
            data: {
                name,
                type: type || undefined,
                description: description || undefined,
                gradeLevel: gradeLevel !== undefined ? gradeLevel : undefined
            }
        });
        res.json(syllabus);
    } catch (error) {
        console.error('Error updating syllabus:', error);
        res.status(500).json({ error: 'Failed to update syllabus' });
    }
});

// Delete Syllabus
app.delete('/api/syllabus/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // Cascade delete is handled by Prisma schema relations if configured properly
        await prisma.syllabus.delete({
            where: { id }
        });
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting syllabus:', error);
        res.status(500).json({ error: 'Failed to delete syllabus' });
    }
});

// Create a Node (Field, Chapter, Section, Paragraph, etc.)
app.post('/api/syllabus-node', async (req, res) => {
    try {
        const { syllabusId, parentId, title, type, orderIndex, contentType, prerequisites } = req.body;

        if (!syllabusId || !title || !type) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const node = await prisma.syllabusNode.create({
            data: {
                syllabusId,
                parentId: parentId || null,
                title,
                nodeType: type, // 'FIELD', 'CHAPTER', 'SECTION', ...
                orderIndex: orderIndex || 0,
                contentType: contentType || null,
                prerequisites: prerequisites || null
            } as any
        });

        res.status(201).json(node);
    } catch (error) {
        console.error('Error creating node:', error);
        res.status(500).json({ error: 'Failed to create node' });
    }
});

// Import Syllabus (JSON)
app.post('/api/syllabus/import', async (req, res) => {
    try {
        const { name, type, tree, ownerId } = req.body;

        if (!name || !tree) {
            return res.status(400).json({ error: 'Missing name or tree data' });
        }

        // 1. Create Syllabus
        const syllabus = await prisma.syllabus.create({
            data: {
                name,
                type: type || 'PERSONAL',
                ownerId: ownerId || null
            }
        });

        // 2. Recursive function to create nodes
        const createNodes = async (nodes: any[], parentId: string | null) => {
            for (const node of nodes) {
                const createdNode = await prisma.syllabusNode.create({
                    data: {
                        syllabusId: syllabus.id,
                        parentId,
                        title: node.Name || node.title,
                        nodeType: node.type || node.nodeType || (node.sections ? 'CHAPTER' : node.paragraphs ? 'SECTION' : 'FIELD'), // Infer or use explicit
                        orderIndex: node.orderIndex || 0,
                        contentType: node.contentType || null
                    }
                });

                // Handle children based on structure (Field -> Chapter -> Section -> Paragraph)
                const children = node.children || node.chapters || node.sections || node.paragraphs || [];
                if (children.length > 0) {
                    await createNodes(children, createdNode.id);
                }

                // Handle Content Items
                if (node.contentItems && node.contentItems.length > 0) {
                    for (const item of node.contentItems) {
                        await prisma.syllabusNode.create({
                            data: {
                                syllabusId: syllabus.id,
                                parentId: createdNode.id,
                                title: item.title || item.name,
                                nodeType: 'CONTENT_ITEM',
                                orderIndex: 0
                            }
                        });
                    }
                }
            }
        };

        // 3. Start recursion from root (Fields)
        if (Array.isArray(tree)) {
            // The tree from fetchSyllabusTree is structure: Field -> chapters -> sections -> paragraphs
            // We need to adapt it. 
            // The incoming tree is likely the output of fetchSyllabusTree.
            // We need to map `SyllabusFieldNode` to something `createNodes` understands, or adapt `createNodes`.

            // Let's assume the client sends the exact structure returned by fetchSyllabusTree
            for (const field of tree) {
                const fieldNode = await prisma.syllabusNode.create({
                    data: { syllabusId: syllabus.id, title: field.Name, nodeType: 'FIELD', orderIndex: 0 }
                });

                for (const chapter of field.chapters || []) {
                    const chapterNode = await prisma.syllabusNode.create({
                        data: { syllabusId: syllabus.id, parentId: fieldNode.id, title: chapter.Name, nodeType: 'CHAPTER', orderIndex: 0 }
                    });

                    for (const section of chapter.sections || []) {
                        const sectionNode = await prisma.syllabusNode.create({
                            data: { syllabusId: syllabus.id, parentId: chapterNode.id, title: section.Name, nodeType: 'SECTION', orderIndex: 0 }
                        });

                        for (const paragraph of section.paragraphs || []) {
                            const pNode = await prisma.syllabusNode.create({
                                data: {
                                    syllabusId: syllabus.id,
                                    parentId: sectionNode.id,
                                    title: paragraph.Name,
                                    nodeType: 'PARAGRAPH',
                                    contentType: paragraph.contentType,
                                    orderIndex: 0
                                }
                            });

                            // Content Items
                            if (paragraph.contentItems) {
                                for (const item of paragraph.contentItems) {
                                    await prisma.syllabusNode.create({
                                        data: { syllabusId: syllabus.id, parentId: pNode.id, title: item.name, nodeType: 'CONTENT_ITEM', orderIndex: 0 }
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }

        res.json(syllabus);
    } catch (error) {
        console.error('Error importing syllabus:', error);
        res.status(500).json({ error: 'Failed to import syllabus' });
    }
});

// Get Nodes for a Syllabus (or children of a node)
app.get('/api/syllabus-node', async (req, res) => {
    try {
        const { syllabusId, parentId } = req.query;

        if (!syllabusId) {
            return res.status(400).json({ error: 'Missing syllabusId' });
        }

        const whereClause: any = { syllabusId: String(syllabusId) };
        if (parentId !== undefined) {
            whereClause.parentId = parentId === 'null' ? null : String(parentId);
        }

        const nodes = await prisma.syllabusNode.findMany({
            where: whereClause,
            orderBy: { orderIndex: 'asc' }
        });

        res.json(nodes);
    } catch (error) {
        console.error('Error fetching nodes:', error);
        res.status(500).json({ error: 'Failed to fetch nodes' });
    }
});

// Update a Node (Rename)
app.put('/api/syllabus-node/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, contentType, prerequisites } = req.body;
        console.log(`Updating node ${id}:`, { title, contentType, prerequisites });

        if (!title) {
            return res.status(400).json({ error: 'Missing title' });
        }

        const node = await prisma.syllabusNode.update({
            where: { id },
            data: {
                title,
                contentType: contentType || undefined, // Only update if provided
                prerequisites: req.body.prerequisites !== undefined ? req.body.prerequisites : undefined
            } as any
        });

        res.json(node);
    } catch (error) {
        console.error('Error updating node:', error);
        res.status(500).json({ error: 'Failed to update node' });
    }
});

// Delete a Node (Cascade delete children)
app.delete('/api/syllabus-node/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Prisma handles cascade delete if relation is configured, otherwise we might need to delete children manually.
        // In schema: `onDelete: Cascade` is set on `parent` relation! So it should work automatically.
        await prisma.syllabusNode.delete({
            where: { id }
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting node:', error);
        res.status(500).json({ error: 'Failed to delete node' });
    }
});

// Get Prerequisites for a list of Node IDs
app.post('/api/syllabus/prerequisites', async (req, res) => {
    try {
        const { nodeIds } = req.body; // Expects array of strings
        if (!Array.isArray(nodeIds) || nodeIds.length === 0) {
            return res.json([]);
        }

        const nodes = await prisma.syllabusNode.findMany({
            where: {
                id: { in: nodeIds },
                prerequisites: { not: null }
            },
            select: {
                id: true,
                title: true,
                prerequisites: true
            }
        });

        res.json(nodes);
    } catch (error) {
        console.error('Error fetching prerequisites:', error);
        res.status(500).json({ error: 'Failed to fetch prerequisites' });
    }
});


// ─── Exercise Types ─────────────────────────────────────────────────

app.get('/api/exercise-type', async (req, res) => {
    try {
        const types = await (prisma as any).exerciseType.findMany({
            orderBy: { name: 'asc' }
        });
        res.json(types);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch exercise types' });
    }
});

app.post('/api/exercise-type', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: 'Missing name' });

        const type = await (prisma as any).exerciseType.create({
            data: { name }
        });
        res.json(type);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create exercise type' });
    }
});

app.delete('/api/exercise-type/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await (prisma as any).exerciseType.delete({ where: { id } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete exercise type' });
    }
});

// ─── Exercises ────────────────────────────────────────────────────────
app.get('/api/exercises', async (req, res) => {
    try {
        const { topicId, difficulty, isPublic, ownerId } = req.query;

        const whereClause: any = {};
        if (topicId) whereClause.topicId = String(topicId);
        if (difficulty) whereClause.difficulty = Number(difficulty);
        if (isPublic !== undefined) whereClause.isPublic = isPublic === 'true';
        if (ownerId) whereClause.ownerId = String(ownerId);

        // If not explicit owner, we might want to return public ones AND owner's
        // Simplification for MVP: Return exactly what filters ask for

        const exercises = await (prisma as any).exercise.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            include: { exerciseType: true, topic: true }
        });

        res.json(exercises);
    } catch (error) {
        console.error('Error fetching exercises:', error);
        res.status(500).json({ error: 'Failed to fetch exercises' });
    }
});

app.post('/api/exercises', async (req, res) => {
    try {
        const data = req.body;

        if (!data.content) {
            return res.status(400).json({ error: 'Missing required field: content' });
        }

        const exercise = await (prisma as any).exercise.create({
            data: {
                title: data.title,
                content: data.content,
                difficulty: data.difficulty || 3,
                typeId: data.typeId,
                hasSolution: !!data.solution || data.hasSolution,
                solution: data.solution,
                description: data.description,
                bibliography: data.bibliography,
                tags: data.tags,
                isPublic: !!data.isPublic,
                ownerId: data.ownerId, // from auth in real system
                orgId: data.orgId,
                topicId: data.topicId,
            }
        });

        res.status(201).json(exercise);
    } catch (error) {
        console.error('Error creating exercise:', error);
        res.status(500).json({ error: 'Failed to create exercise' });
    }
});

app.put('/api/exercises/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const exercise = await (prisma as any).exercise.update({
            where: { id },
            data: {
                title: data.title,
                content: data.content,
                difficulty: data.difficulty,
                typeId: data.typeId,
                hasSolution: data.solution ? true : data.hasSolution,
                solution: data.solution,
                description: data.description,
                bibliography: data.bibliography,
                tags: data.tags,
                isPublic: data.isPublic,
                topicId: data.topicId,
            }
        });

        res.json(exercise);
    } catch (error) {
        console.error('Error updating exercise:', error);
        res.status(500).json({ error: 'Failed to update exercise' });
    }
});

app.get('/api/exercises/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const exercise = await (prisma as any).exercise.findUnique({
            where: { id },
            include: { exerciseType: true, topic: true }
        });

        if (!exercise) return res.status(404).json({ error: 'Exercise not found' });
        res.json(exercise);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch exercise' });
    }
});

app.post('/api/exercises/:id/record-usage', async (req, res) => {
    try {
        const { id } = req.params;
        const exercise = await (prisma as any).exercise.update({
            where: { id },
            data: {
                usageStatistics: { increment: 1 }
            }
        });
        res.json({ success: true, usageStatistics: exercise.usageStatistics });
    } catch (error) {
        res.status(500).json({ error: 'Failed to record usage' });
    }
});

app.delete('/api/exercises/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await (prisma as any).exercise.delete({ where: { id } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete exercise' });
    }
});

app.listen(port, () => {
    console.log(`🚀 SaaS API Server running at http://localhost:${port}`);
});
