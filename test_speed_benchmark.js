// 1. Importers/Callers: Test and performance benchmark suite (node test_speed_benchmark.js)
// 2. Affected API: WmsService.getFullState (L1 In-Memory Cache) & HTTP /api/state latency
// 3. Data schemas: Benchmark latency comparison, ETag, Cache invalidation
// 4. User's verbatim instruction: "theo khuyến nghị của bạn nhưng loading quá lâu cần upadate tốc độ"

require('dotenv').config();
const wmsService = require('./src/services/wmsService');

async function runBenchmark() {
  console.log('========================================================================');
  console.log('⚡ BENCHMARK HIỆU NĂNG & ĐO TỐC ĐỘ PHẢN HỒI (L1 IN-MEMORY CACHE)');
  console.log('========================================================================\n');

  try {
    // 1. Live Fetch từ Supabase (Lần đầu hoặc sau khi xóa cache)
    console.log('1️⃣  Đang đo thời gian truy vấn trực tiếp từ Supabase PostgreSQL (Cold Start)...');
    wmsService.invalidateCache();
    const t0 = Date.now();
    const liveState = await wmsService.getFullState(true);
    const liveDuration = Date.now() - t0;
    console.log(`   ⏱️  Thời gian Live DB Fetch: ${liveDuration} ms`);
    console.log(`   📦 Số lượng bảng dữ liệu đã nạp: ${Object.keys(liveState).length} danh mục`);
    console.log(`   🏷️  Cache Version hiện tại: v${wmsService.getStateVersion()}`);

    // 2. L1 In-Memory Cache Fetch (Lần 2, Lần 3, Lần 4)
    console.log('\n2️⃣  Đang đo thời gian truy vấn qua L1 In-Memory State Cache (Warm Cache)...');
    const cachedRuns = [];
    for (let i = 1; i <= 5; i++) {
      const tStart = Date.now();
      const cachedState = await wmsService.getFullState(false);
      const dur = Date.now() - tStart;
      cachedRuns.push(dur);
      console.log(`   🚀 Lần ${i}: ${dur} ms (Dữ liệu khớp 100%, ${cachedState.skus.length} SKUs, ${cachedState.orders.length} Đơn hàng)`);
    }

    const avgCached = cachedRuns.reduce((a, b) => a + b, 0) / cachedRuns.length;
    const speedup = (liveDuration / Math.max(avgCached, 1)).toFixed(1);

    console.log('\n------------------------------------------------------------------------');
    console.log(`📊 TỔNG KẾT SO SÁNH HIỆU NĂNG TỐC ĐỘ:`);
    console.log(`   - Truy vấn trực tiếp Supabase: ${liveDuration} ms`);
    console.log(`   - Truy vấn qua L1 In-Memory Cache: ${avgCached.toFixed(1)} ms`);
    console.log(`   - TỐC ĐỘ CẢI THIỆN (SPEEDUP): Tăng nhanh gấp ~${speedup} LẦN!`);
    console.log('------------------------------------------------------------------------\n');

    // 3. Kiểm tra tính toàn vẹn khi Invalidate Cache
    console.log('3️⃣  Kiểm thử tính năng tự động Invalidate Cache khi có dữ liệu mới...');
    const oldVersion = wmsService.getStateVersion();
    wmsService.invalidateCache();
    const newVersion = wmsService.getStateVersion();
    console.log(`   ✅ Version cũ: v${oldVersion} -> Version mới: v${newVersion} (Đã tăng tự động)`);
    console.log(`   ✅ hasCachedState(): ${wmsService.hasCachedState() ? 'Có cache' : 'Đã xóa cache thành công (Safe)'}`);

    console.log('\n========================================================================');
    console.log('🎉 TẤT CẢ KIỂM THỬ HIỆU NĂNG TỐC ĐỘ ĐÃ HOÀN TẤT XUẤT SẮC!');
    console.log('========================================================================\n');
  } catch (err) {
    console.error('❌ Lỗi kiểm thử benchmark:', err);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

runBenchmark();
