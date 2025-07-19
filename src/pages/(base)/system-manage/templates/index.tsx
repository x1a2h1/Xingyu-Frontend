import { Editor } from './modules/Editor';

const Templates = () => {
  // 标签页切换状态
  const [activeTab, setActiveTab] = useState<'privacyPolicy' | 'userAgreement'>('userAgreement');

  // 标签项配置
  const tabItems = [
    {
      key: 'userAgreement',
      label: '用户协议'
    },
    {
      key: 'privacyPolicy',
      label: '隐私政策'
    }
  ];

  // 处理标签页切换
  const handleTabChange = (key: string) => {
    setActiveTab(key as 'privacyPolicy' | 'userAgreement');
  };

  return (
    <div className="p-4">
      {/* 上部分卡片：标签页切换 */}
      <ACard className="mb-4">
        <ATabs
          activeKey={activeTab}
          items={tabItems}
          onChange={handleTabChange}
        />
      </ACard>

      {/* 下部分卡片：编辑器内容 */}
      <ACard>
        <Editor type={activeTab} />
      </ACard>
    </div>
  );
};

export default Templates;
