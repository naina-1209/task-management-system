import type { Task } from '@/types';
import { formatDate } from './utils';

export function exportTasksToCSV(tasks: Task[], categories: Record<string, string>): void {
  const headers = [
    'Title',
    'Description',
    'Priority',
    'Status',
    'Due Date',
    'Category',
    'Tags',
    'Estimated Time (min)',
    'Notes',
    'Archived',
    'Pinned',
    'Favorite',
    'Created At',
  ];

  const escape = (val: string | number | boolean | null | undefined): string => {
    const s = String(val ?? '');
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const rows = tasks.map((t) =>
    [
      t.title,
      t.description ?? '',
      t.priority,
      t.status,
      t.due_date ? formatDate(t.due_date) : '',
      t.category_id ? categories[t.category_id] ?? '' : '',
      (t.tags ?? []).join('; '),
      t.estimated_time ?? '',
      t.notes ?? '',
      t.archived,
      t.pinned,
      t.favorite,
      formatDate(t.created_at),
    ]
      .map(escape)
      .join(',')
  );

  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `tasks-export-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export interface ParsedCSVRow {
  title: string;
  description?: string;
  priority?: string;
  status?: string;
  due_date?: string;
  category?: string;
  tags?: string[];
  estimated_time?: number;
  notes?: string;
}

export function parseTasksCSV(text: string): ParsedCSVRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '');
  if (lines.length < 2) return [];

  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
    result.push(current);
    return result;
  };

  const headers = parseLine(lines[0]).map((h) => h.trim().toLowerCase());
  const rows: ParsedCSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = (values[idx] ?? '').trim();
    });
    rows.push({
      title: row['title'] ?? '',
      description: row['description'] || undefined,
      priority: row['priority'] || undefined,
      status: row['status'] || undefined,
      due_date: row['due date'] || undefined,
      category: row['category'] || undefined,
      tags: row['tags'] ? row['tags'].split(';').map((t) => t.trim()).filter(Boolean) : undefined,
      estimated_time: row['estimated time (min)'] ? Number(row['estimated time (min)']) || undefined : undefined,
      notes: row['notes'] || undefined,
    });
  }
  return rows;
}
