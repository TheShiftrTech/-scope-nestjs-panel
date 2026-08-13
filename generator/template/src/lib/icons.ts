import {
  Users,
  User,
  LayoutDashboard,
  Settings,
  Heart,
  Shield,
  Database,
  Activity,
  File,
  FileText,
  Mail,
  Bell,
  Package,
  Boxes,
  Server,
  Key,
  Lock,
  Globe,
  Home,
  List,
  type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  users: Users,
  user: User,
  settings: Settings,
  health: Heart,
  heart: Heart,
  dashboard: LayoutDashboard,
  layoutdashboard: LayoutDashboard,
  LayoutDashboard: LayoutDashboard,
  shield: Shield,
  Shield: Shield,
  database: Database,
  activity: Activity,
  file: File,
  filetext: FileText,
  mail: Mail,
  bell: Bell,
  package: Package,
  boxes: Boxes,
  server: Server,
  key: Key,
  lock: Lock,
  globe: Globe,
  home: Home,
  list: List,
};

/** Resolve a Lucide icon by manifest/env name (case-insensitive for kebab keys). */
export function resolveIcon(name: string | undefined): LucideIcon {
  if (!name) {
    return LayoutDashboard;
  }
  return iconMap[name] ?? iconMap[name.toLowerCase()] ?? LayoutDashboard;
}

export { iconMap };
