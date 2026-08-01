export interface AdConfig {
  enabled: boolean;
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
    scriptSrc: 'https://pl28388656.effectivegatecpm.com/94c6902af301c499880abc8393d41008/invoke.js',
  },
};

// 辅助函数：检查特定位置是否启用
export function isAdPositionEnabled(position: keyof AdConfig['positions']): boolean {
  return adConfig.enabled && adConfig.positions[position];
}

