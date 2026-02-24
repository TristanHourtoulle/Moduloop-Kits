/**
 * Generates a deterministic key for project components based on project data.
 * This ensures proper component remounting when project data changes on Vercel.
 *
 * The key is generated from:
 * - Project ID
 * - Project name
 * - Project description
 * - Project kits (sorted for consistency)
 *
 * This approach ensures the component remounts when any significant data changes,
 * forcing a fresh render with updated props.
 */
export function generateProjectKey(projectId: string, projectData: object): string {
  if (!projectData) {
    return `project-${projectId}-empty`;
  }

  const data = projectData as Record<string, unknown>;

  // Create a deterministic string from project data
  const dataPoints = [
    projectId,
    data.nom || '',
    data.description || '',
  ];

  // Add sorted kit IDs if they exist
  if (data.kits && Array.isArray(data.kits)) {
    const sortedKitIds = (data.kits as Array<Record<string, unknown>>)
      .map((kit) => kit.kitId || kit.id || '')
      .sort()
      .join(',');
    dataPoints.push(sortedKitIds);
  }

  const dataString = dataPoints.join('-');

  // Simple hash function to create a shorter key
  let hash = 0;
  for (let i = 0; i < dataString.length; i++) {
    const char = dataString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return `project-${projectId}-${Math.abs(hash)}`;
}