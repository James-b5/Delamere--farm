import { prisma } from './prisma';

export async function syncTagsForPost(postId: string, tags: string[]|string|null) {
  if (!tags) return;
  const tagList = Array.isArray(tags) ? tags : String(tags).split(',').map(t => t.trim()).filter(Boolean);

  // find or create tags
  const tagIds: string[] = [];
  for (const name of tagList) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let tag = await prisma.tag.findUnique({ where: { slug } });
    if (!tag) {
      tag = await prisma.tag.create({ data: { name, slug } });
    }
    tagIds.push(tag.id);
  }

  // remove existing relations not in new list
  await prisma.postTag.deleteMany({ where: { postId, tagId: { notIn: tagIds } } });

  // ensure relations exist
  for (const tagId of tagIds) {
    const existing = await prisma.postTag.findUnique({ where: { postId_tagId: { postId, tagId } } });
    if (!existing) {
      await prisma.postTag.create({ data: { postId, tagId } });
    }
  }
}

export async function clearTagsForPost(postId: string) {
  await prisma.postTag.deleteMany({ where: { postId } });
}
