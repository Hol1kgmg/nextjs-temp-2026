import type { NextConfig } from 'next';

// eslint-plugin-commandを導入している場合、@keep-sortedを付与することでプロパティの順番をソートできる
// @keep-sorted
const nextConfig: NextConfig = {
  /* config options here */
  // Cache Component を有効にするための設定
  cacheComponents: true,
  // 実質SSGを実現するための設定
  // 手動でのみrevalidateできるcacheLife
  cacheLife: {
    infinite: {
      stale: Number.MAX_VALUE,
      revalidate: Number.MAX_VALUE,
      expire: Number.MAX_VALUE,
    },
  },
  // ブラウザ側のログをサーバーサイド側にも表示する
  experimental: {
    browserDebugInfoInTerminal: true,
  },
  // fetch時に完全なURLやキャッシュヒットの有無を表示するための設定
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  //React Compilerを有効にするための設定
  reactCompiler: true,
  // Linkのhrefに詳細な型をつけるための設定
  typedRoutes: true,
};

export default nextConfig;
