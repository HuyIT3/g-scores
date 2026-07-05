import { useState, useEffect } from 'react';
import {
  Search as SearchIcon,
  GraduationCap,
  TrendingUp,
  Trophy,
  AlertCircle,
  X,
  Loader2,
  Crown,
  BookOpen
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import './App.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface ScoreInfo {
  code: string;
  name: string;
  score: number | null;
  level: string | null;
}

interface StudentResult {
  sbd: string;
  ma_ngoai_ngu: string | null;
  scores: ScoreInfo[];
}

interface SubjectStat {
  code: string;
  name: string;
  levels: {
    '>=8': number;
    '6-8': number;
    '4-6': number;
    '<4': number;
  };
}

interface TopStudent {
  rank: number;
  sbd: string;
  scores: {
    toan: number;
    vat_li: number;
    hoa_hoc: number;
  };
  totalScore: number;
}

function App() {
  const [activeTab, setActiveTab] = useState<'search' | 'stats' | 'leaderboard'>('search');

  // Search state
  const [searchSbd, setSearchSbd] = useState('');
  const [searchResult, setSearchResult] = useState<StudentResult | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Stats state
  const [statsData, setStatsData] = useState<SubjectStat[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Leaderboard state
  const [topStudents, setTopStudents] = useState<TopStudent[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);

  // Fetch stats when tab changes to stats
  useEffect(() => {
    if (activeTab === 'stats' && statsData.length === 0) {
      fetchStats();
    } else if (activeTab === 'leaderboard' && topStudents.length === 0) {
      fetchLeaderboard();
    }
  }, [activeTab]);

  const fetchStats = async () => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const res = await fetch(`${API_BASE}/api/reports/statistics`);
      if (!res.ok) throw new Error('Không thể tải dữ liệu thống kê');
      const data = await res.json();
      setStatsData(data);
    } catch (err: any) {
      setStatsError(err.message || 'Có lỗi xảy ra khi tải dữ liệu thống kê.');
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    setLeaderboardLoading(true);
    setLeaderboardError(null);
    try {
      const res = await fetch(`${API_BASE}/api/reports/top10`);
      if (!res.ok) throw new Error('Không thể tải danh sách thủ khoa');
      const data = await res.json();
      setTopStudents(data);
    } catch (err: any) {
      setLeaderboardError(err.message || 'Có lỗi xảy ra khi tải danh sách thủ khoa.');
    } finally {
      setLeaderboardLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchSbd.trim();
    if (!trimmed) return;

    if (!/^[0-9]{8}$/.test(trimmed)) {
      setSearchError('Số báo danh không hợp lệ. SBD phải gồm đúng 8 chữ số.');
      setSearchResult(null);
      return;
    }

    setSearchLoading(true);
    setSearchError(null);
    setSearchResult(null);

    try {
      const res = await fetch(`${API_BASE}/api/scores/${trimmed}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Không tìm thấy kết quả.');
      }

      setSearchResult(data);
    } catch (err: any) {
      setSearchError(err.message || 'Lỗi kết nối đến máy chủ.');
    } finally {
      setSearchLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchSbd('');
    setSearchResult(null);
    setSearchError(null);
  };

  // Helper: Calculate average score of a student
  const getAverageScore = (result: StudentResult) => {
    const validScores = result.scores.filter(s => s.score !== null);
    if (validScores.length === 0) return 0;
    const sum = validScores.reduce((acc, curr) => acc + (curr.score || 0), 0);
    return (sum / validScores.length).toFixed(2);
  };

  // Helper: Count subjects taken
  const getSubjectCount = (result: StudentResult) => {
    return result.scores.filter(s => s.score !== null).length;
  };

  // Transform Recharts stats
  const chartData = statsData.map(item => ({
    name: item.name,
    'Kém (<4)': item.levels['<4'],
    'Trung bình (4-6)': item.levels['4-6'],
    'Khá (6-8)': item.levels['6-8'],
    'Giỏi (>=8)': item.levels['>=8'],
  }));

  // Render Podium elements
  const renderPodium = () => {
    if (topStudents.length < 3) return null;
    const gold = topStudents[0];
    const silver = topStudents[1];
    const bronze = topStudents[2];

    return (
      <div className="podium-container">
        {/* Silver - Rank 2 */}
        <div className="podium-column silver">
          <div className="podium-avatar-wrapper">
            <div className="podium-medal">2</div>
          </div>
          <div className="podium-block">
            <div className="podium-sbd">SBD: {silver.sbd}</div>
            <div className="podium-score">{silver.totalScore} đ</div>
            <div className="podium-details">
              <span>Toán: {silver.scores.toan}</span>
              <span>Lý: {silver.scores.vat_li}</span>
              <span>Hóa: {silver.scores.hoa_hoc}</span>
            </div>
          </div>
        </div>

        {/* Gold - Rank 1 */}
        <div className="podium-column gold">
          <div className="podium-avatar-wrapper">
            <Crown className="podium-crown" size={32} />
            <div className="podium-medal">1</div>
          </div>
          <div className="podium-block">
            <div className="podium-sbd">SBD: {gold.sbd}</div>
            <div className="podium-score">{gold.totalScore} đ</div>
            <div className="podium-details">
              <span>Toán: {gold.scores.toan}</span>
              <span>Lý: {gold.scores.vat_li}</span>
              <span>Hóa: {gold.scores.hoa_hoc}</span>
            </div>
          </div>
        </div>

        {/* Bronze - Rank 3 */}
        <div className="podium-column bronze">
          <div className="podium-avatar-wrapper">
            <div className="podium-medal">3</div>
          </div>
          <div className="podium-block">
            <div className="podium-sbd">SBD: {bronze.sbd}</div>
            <div className="podium-score">{bronze.totalScore} đ</div>
            <div className="podium-details">
              <span>Toán: {bronze.scores.toan}</span>
              <span>Lý: {bronze.scores.vat_li}</span>
              <span>Hóa: {bronze.scores.hoa_hoc}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="logo-wrapper">
          <GraduationCap className="logo-icon" size={48} />
          <h1 className="app-title">G-Scores</h1>
        </div>
        <p className="app-subtitle">Hệ thống Tra cứu & Phân tích phổ điểm thi tốt nghiệp THPT Quốc gia 2024</p>
      </header>

      {/* Tabs */}
      <nav className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          <SearchIcon size={18} />
          Tra cứu điểm
        </button>
        <button
          className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          <TrendingUp size={18} />
          Thống kê phổ điểm
        </button>
        <button
          className={`tab-btn ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaderboard')}
        >
          <Trophy size={18} />
          Bảng vàng Khối A
        </button>
      </nav>

      {/* Main Panels */}
      <main className="panel-container">
        {/* SEARCH TAB */}
        {activeTab === 'search' && (
          <div className="search-view">
            <form onSubmit={handleSearch} className="search-box-wrapper">
              <div className="search-input-container">
                <SearchIcon className="search-icon" size={20} />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Nhập số báo danh thí sinh..."
                  value={searchSbd}
                  onChange={(e) => setSearchSbd(e.target.value)}
                />
                {searchSbd && (
                  <button type="button" className="clear-btn" onClick={clearSearch}>
                    <X size={18} />
                  </button>
                )}
                <button type="submit" className="search-btn">
                  Tìm kiếm
                </button>
              </div>
              <p className="search-helper-text">
                Nhập số báo danh 8 chữ số của bạn (Ví dụ: 01000001, 01000002, 01000003...)
              </p>
            </form>

            {searchLoading && (
              <div className="loader-container">
                <Loader2 className="spinner" size={40} />
                <span className="loading-text">Đang truy vấn dữ liệu điểm thi...</span>
              </div>
            )}

            {searchError && (
              <div className="error-message">
                <AlertCircle size={20} />
                <span>{searchError}</span>
              </div>
            )}

            {searchResult && (
              <div className="result-card">
                <div className="result-header">
                  <div className="candidate-info">
                    <span className="sbd-label">Thí sinh</span>
                    <h2 className="candidate-sbd">
                      SBD: {searchResult.sbd}
                    </h2>
                    {searchResult.ma_ngoai_ngu && (
                      <span className="candidate-foreign-lang">
                        <BookOpen size={14} />
                        Mã Ngoại ngữ: {searchResult.ma_ngoai_ngu}
                      </span>
                    )}
                  </div>
                  <div className="candidate-summary">
                    <div className="stat-box">
                      <span className="stat-val">{getAverageScore(searchResult)}</span>
                      <span className="stat-lbl">Điểm trung bình</span>
                    </div>
                    <div className="stat-box">
                      <span className="stat-val">{getSubjectCount(searchResult)}/9</span>
                      <span className="stat-lbl">Môn đã thi</span>
                    </div>
                  </div>
                </div>

                <div className="scores-grid">
                  {searchResult.scores.map((sub) => (
                    <div key={sub.code} className="subject-score-card">
                      <div className="subject-header">
                        <span className="subject-name">{sub.name}</span>
                        {sub.score !== null ? (
                          <span className={`level-badge ${sub.level?.toLowerCase() === '>=8' ? 'excellent' : sub.level?.toLowerCase() === '6-8' ? 'good' : sub.level?.toLowerCase() === '4-6' ? 'average' : 'poor'}`}>
                            {sub.level}
                          </span>
                        ) : (
                          <span className="level-badge absent">Vắng</span>
                        )}
                      </div>
                      <div className="subject-score-val">
                        {sub.score !== null ? sub.score.toFixed(2) : <span className="score-absent">-</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STATISTICS TAB */}
        {activeTab === 'stats' && (
          <div className="stats-view">
            <div className="stats-header-bar">
              <h2 className="section-title">
                <TrendingUp size={24} />
                Thống kê phổ điểm các môn học
              </h2>
            </div>

            {statsLoading && (
              <div className="loader-container">
                <Loader2 className="spinner" size={40} />
                <span className="loading-text">Đang phân tích phổ điểm các môn học...</span>
              </div>
            )}

            {statsError && (
              <div className="error-message">
                <AlertCircle size={20} />
                <span>{statsError}</span>
              </div>
            )}

            {!statsLoading && !statsError && statsData.length > 0 && (
              <>
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis
                        dataKey="name"
                        stroke="#94a3b8"
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                      />
                      <YAxis
                        stroke="#94a3b8"
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        tickFormatter={(value) => value.toLocaleString('vi-VN')}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          borderColor: 'rgba(255,255,255,0.1)',
                          color: '#f8fafc',
                          borderRadius: '8px'
                        }}
                        formatter={(value: any) => [Number(value).toLocaleString('vi-VN') + ' học sinh']}
                      />
                      <Legend
                        wrapperStyle={{ paddingTop: 10 }}
                        inactiveColor="#64748b"
                      />
                      <Bar dataKey="Kém (<4)" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="Trung bình (4-6)" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="Khá (6-8)" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="Giỏi (>=8)" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="stats-grid">
                  {statsData.map((item) => (
                    <div key={item.code} className="stats-card">
                      <h3 className="stats-card-subject">{item.name}</h3>
                      <div className="stats-row-list">
                        <div className="stats-row">
                          <span className="stats-label">{"Giỏi (>=8.0):"}</span>
                          <span className="stats-val-num" style={{ color: 'var(--level-excellent)' }}>
                            {item.levels['>=8'].toLocaleString('vi-VN')}
                          </span>
                        </div>
                        <div className="stats-row">
                          <span className="stats-label">Khá (6.0 - 8.0):</span>
                          <span className="stats-val-num" style={{ color: 'var(--level-good)' }}>
                            {item.levels['6-8'].toLocaleString('vi-VN')}
                          </span>
                        </div>
                        <div className="stats-row">
                          <span className="stats-label">Trung bình (4.0 - 6.0):</span>
                          <span className="stats-val-num" style={{ color: 'var(--level-average)' }}>
                            {item.levels['4-6'].toLocaleString('vi-VN')}
                          </span>
                        </div>
                        <div className="stats-row">
                          <span className="stats-label">{"Kém (<4.0):"}</span>
                          <span className="stats-val-num" style={{ color: 'var(--level-poor)' }}>
                            {item.levels['<4'].toLocaleString('vi-VN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* LEADERBOARD TAB */}
        {activeTab === 'leaderboard' && (
          <div className="leaderboard-view">
            <h2 className="section-title">
              <Trophy size={24} style={{ color: '#fbbf24' }} />
              Top 10 Thủ khoa Khối A (Toán - Lý - Hóa)
            </h2>

            {leaderboardLoading && (
              <div className="loader-container">
                <Loader2 className="spinner" size={40} />
                <span className="loading-text">Đang thống kê danh sách thủ khoa...</span>
              </div>
            )}

            {leaderboardError && (
              <div className="error-message">
                <AlertCircle size={20} />
                <span>{leaderboardError}</span>
              </div>
            )}

            {!leaderboardLoading && !leaderboardError && topStudents.length > 0 && (
              <>
                {/* Visual Podium */}
                {renderPodium()}

                {/* Remaining Leaderboard Table */}
                <div className="table-wrapper">
                  <table className="leaderboard-table">
                    <thead>
                      <tr>
                        <th>Hạng</th>
                        <th>SBD</th>
                        <th>Chi tiết điểm số</th>
                        <th style={{ textAlign: 'right' }}>Tổng điểm Khối A</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topStudents.slice(3).map((student) => (
                        <tr key={student.sbd}>
                          <td className="rank-cell">
                            <span className="rank-badge">{student.rank}</span>
                          </td>
                          <td className="sbd-cell">{student.sbd}</td>
                          <td>
                            <div className="score-breakdown">
                              <span>Toán: <strong>{student.scores.toan}</strong></span>
                              <span>Vật lý: <strong>{student.scores.vat_li}</strong></span>
                              <span>Hóa học: <strong>{student.scores.hoa_hoc}</strong></span>
                            </div>
                          </td>
                          <td className="total-score-cell">{student.totalScore} đ</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>© 2026 G-Scores. Phát triển bởi ứng viên Hoàng Huy ứng tuyển vị trí Intern Fullstack JS.</p>
        <p style={{ marginTop: '0.25rem' }}>
          Yêu cầu tuyển dụng tại <a href="https://goldenowl.asia" target="_blank" rel="noreferrer">Golden Owl Solutions</a>.
        </p>
      </footer>
    </div>
  );
}

export default App;
