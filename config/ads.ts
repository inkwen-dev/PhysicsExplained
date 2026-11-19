export interface AdConfig {
  enabled: boolean;
  bannerEnabled: boolean;
  socialBar: { enabled: boolean; scriptSrc: string };
  positions: {
    // 文章详情页
    articleAfterRelated: boolean;      // 位置1：文章正文下方，Related Topics上方
    
    // 首页
    homeAfterTopics: boolean;          // 位置1：Featured Topics之后
    
    // 分类页
    categoryListAfterList: boolean;    // 分类列表页：分类列表之后
    categoryAfterList: boolean;        // 主分类页：文章列表之后
    subcategoryAfterList: boolean;     // 子分类页：文章列表之后
  };
  nativeBanner: {
    containerId: string;
    scriptSrc: string;
  };
}

// 判断是否为生产环境
const isProduction = process.env.NODE_ENV === 'production';

// 生产环境：默认启用，只有环境变量明确设置为 'false' 时才关闭
// 开发环境：默认关闭，避免 403 错误
const getAdEnabled = (): boolean => {
  if (!isProduction) {
    // 开发环境：只有明确设置为 'true' 时才启用（用于测试）
    return process.env.NEXT_PUBLIC_ADS_ENABLED === 'true';
  }
  // 生产环境：默认启用，只有明确设置为 'false' 时才关闭
  return process.env.NEXT_PUBLIC_ADS_ENABLED !== 'false';
};

export const adConfig: AdConfig = {
  enabled: getAdEnabled(),
  bannerEnabled: process.env.NEXT_PUBLIC_BANNERS_ENABLED !== 'false',
  socialBar: { enabled: process.env.NEXT_PUBLIC_SOCIAL_BAR_ENABLED !== 'false', scriptSrc: 'https://bauval.org/14/3bb1fe5878d063570ad42431f16b0664' },
  positions: {
    // 文章详情页 - 已启用：文章正文下方，Related Topics上方
    articleAfterRelated: getAdEnabled(),
    
    // 首页 - 已启用：Featured Topics之后
    homeAfterTopics: getAdEnabled(),
    
    // 分类页 - 已启用
    categoryListAfterList: getAdEnabled(),    // 分类列表页：分类列表之后
    categoryAfterList: getAdEnabled(),        // 主分类页：文章列表之后
    subcategoryAfterList: getAdEnabled(),    // 子分类页：文章列表之后
  },
  nativeBanner: {
    containerId: 'container-94c6902af301c499880abc8393d41008',
    scriptSrc: 'https://bauval.org/21/94c6902af301c499880abc8393d41008',
  },
};

// 辅助函数：检查特定位置是否启用
export function isAdPositionEnabled(position: keyof AdConfig['positions']): boolean {
  return adConfig.enabled && adConfig.positions[position];
}


export type BannerPosition = 'top' | 'middle' | 'lower' | 'sidebar';
// GET CODE, physicsexplained.org (5507839), 2026-11-19. Public placement keys.
export const bannerUnits = {
  rectangle: { id: 32363859, key: '7c6b788a8b08f2add3d03665bd15e0e8', width: 300, height: 250, scriptSrc: 'https://bauval.org/22/7c6b788a8b08f2add3d03665bd15e0e8' },
  mobile: { id: 32363860, key: '05efddc2874dcc0282ba87a0998ea513', width: 320, height: 50, scriptSrc: 'https://bauval.org/22/05efddc2874dcc0282ba87a0998ea513' },
  leaderboard: { id: 32363861, key: '25ed84f5e635bcd32f7e0da160ef1a81', width: 728, height: 90, scriptSrc: 'https://bauval.org/22/25ed84f5e635bcd32f7e0da160ef1a81' },
  sidebar: { id: 32363862, key: '7f35b1d0688d5a048bdbb14e02e25950', width: 160, height: 600, scriptSrc: 'https://bauval.org/22/7f35b1d0688d5a048bdbb14e02e25950' },
  compact: { id: 32363923, key: '9dd13de19f976d495bfca18f6b426014', width: 468, height: 60, scriptSrc: 'https://bauval.org/22/9dd13de19f976d495bfca18f6b426014' },
};
