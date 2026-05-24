export interface Tool {
  id: string;
  name: string;
  desc: string;
  icon: string;
  badge?: string;
  requiresImage: boolean;
  requiresHFToken?: boolean;
}

export const TOOLS: Tool[] = [
  {
    id: 'colorize',
    name: 'Colorize',
    desc: 'Warnai foto B&W',
    icon: '🎨',
    badge: 'AI',
    requiresImage: true,
    requiresHFToken: true,
  },
  {
    id: 'upscale',
    name: 'AI Upscale',
    desc: 'Tingkatkan resolusi',
    icon: '✨',
    badge: 'AI',
    requiresImage: true,
    requiresHFToken: true,
  },
  {
    id: 'enhance',
    name: 'Enhance',
    desc: 'Tajamkan detail',
    icon: '⚡',
    requiresImage: true,
    requiresHFToken: false,
  },
  {
    id: 'resize',
    name: 'Resize Image',
    desc: 'Crop & Scale',
    icon: '↔️',
    requiresImage: true,
    requiresHFToken: false,
  },
  {
    id: 'convert',
    name: 'Convert',
    desc: 'Ganti format',
    icon: '🔄',
    requiresImage: true,
    requiresHFToken: false,
  },
  {
    id: 'ascii',
    name: 'ASCII Studio',
    desc: 'Foto jadi ASCII art',
    icon: '🅰️',
    requiresImage: true,
    requiresHFToken: false,
  },
  {
    id: 'qr',
    name: 'QR Studio',
    desc: 'Buat & Scan QR',
    icon: '▣',
    requiresImage: false,
    requiresHFToken: false,
  },
  {
    id: 'filter',
    name: 'Filter',
    desc: 'Efek & tone foto',
    icon: '🌈',
    requiresImage: true,
    requiresHFToken: false,
  },
];

export const HF_MODELS: Record<string, string> = {
  colorize: 'ioclab/ioclab-colorization',
  upscale: 'caidas/swin2SR-realworld-sr-x4-64',
};
