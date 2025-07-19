import Markdown from 'markdown-to-jsx';
import './markdown.css';
import React from 'react';

import { fetchGetSetting, fetchSetSetting } from '@/service/api';
// 模拟保存内容的API函数
const savePolicyContent = async (type: string, content: string) => {
  if (type === 'userAgreement') {
    // await fetchPutUserAgreement(params).then((res: any) => {
    //   if (res.code === 200) {
    //     return res.data;
    //   }
    // });
    await fetchSetSetting('user_agreement', { value: content }).then((res: any) => {
      if (res.code === 200) {
        return res.data;
      }
      return null;
    });
  } else {
    // await fetchPutPrivacyPolicy(params).then((res: any) => {
    //   if (res.code === 200) {
    //     return res.data;
    //   }
    // });
    await fetchSetSetting('privacy_policy', { value: content }).then((res: any) => {
      if (res.code === 200) {
        return res.data;
      }
      return null;
    });
  }
  return { success: true };
};

// 可用变量列表
const AVAILABLE_VARIABLES = [
  { description: '公司/机构的名称', key: '.ENTITY_NAME', name: '公司名称' },
  { description: '应用程序名称', key: '.APP_NAME', name: 'APP名称' }
];

// 工具函数：处理文本中的变量标记并高亮显示
const highlightVariables = (text: string) => {
  if (typeof text !== 'string') return text;

  const parts = [];
  let lastIndex = 0;
  const regex = /\[\[(.*?)\]\]/g;
  let match: RegExpExecArray | null;

  // 查找所有变量标记
  while ((match = regex.exec(text)) !== null) {
    const [fullMatch] = match;
    const matchIndex = match.index;

    // 添加变量前的文本
    if (matchIndex > lastIndex) {
      parts.push(text.substring(lastIndex, matchIndex));
    }

    // 添加高亮的变量
    const variableKey = match[1];
    parts.push(
      <span
        className="mx-0.5 border border-purple-200 rounded bg-purple-100 px-1.5 py-0.5 text-purple-800 font-medium"
        key={`var-${matchIndex}`}
      >
        {AVAILABLE_VARIABLES.find(variable => variable.key === variableKey)?.name}
      </span>
    );

    lastIndex = matchIndex + fullMatch.length;
  }

  // 添加最后一部分文本
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 1 ? parts : text;
};

// 递归处理文本节点的函数
const processTextNodes = (children: React.ReactNode): React.ReactNode => {
  if (typeof children === 'string') {
    return highlightVariables(children);
  }

  if (Array.isArray(children)) {
    return children.map(child => processTextNodes(child));
  }

  if (React.isValidElement(children)) {
    const props = children.props as { children?: React.ReactNode };
    return React.cloneElement(children, {}, processTextNodes(props.children));
  }

  return children;
};

interface EditorProps {
  readonly type: 'privacyPolicy' | 'userAgreement';
}

export function Editor({ type }: EditorProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // 加载内容
  useEffect(() => {
    setLoading(true);
    if (type === 'userAgreement') {
      // fetchGetUserAgreement().then((res: any) => {
      //   setContent(res.data);
      // });
      fetchGetSetting<string>('user_agreement').then((res: any) => {
        setContent(res.data);
      });
    } else {
      // fetchGetPrivacyPolicy().then((res: any) => {
      //   setContent(res.data);
      // });
      fetchGetSetting<string>('privacy_policy').then((res: any) => {
        setContent(res.data);
      });
    }
    setLoading(false);
  }, [type]);

  // 保存内容
  const handleSave = async () => {
    setSaving(true);
    try {
      await savePolicyContent(type, content);
      window.$message?.success('保存成功');
    } catch {
      window.$message?.error('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  // 备选插入方法
  const fallbackInsert = (text: string) => {
    if (!textAreaRef.current) return;

    const textarea = textAreaRef.current;
    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;

    // 在选中区域插入文本
    const newContent = textarea.value.substring(0, selectionStart) + text + textarea.value.substring(selectionEnd);

    // 设置新内容
    setContent(newContent);

    // 立即更新DOM上的值，以确保光标位置计算正确
    textarea.value = newContent;

    // 更新光标位置
    const newCursorPosition = selectionStart + text.length;
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPosition, newCursorPosition);
    }, 0);
  };

  // 使用document.execCommand插入变量
  const insertVariable = (variable: { key: string }) => {
    const variableText = `[[${variable.key}]]`;

    if (textAreaRef.current) {
      // 确保文本区域获得焦点
      textAreaRef.current.focus();

      // 尝试使用document.execCommand插入文本
      try {
        // 检查浏览器是否支持execCommand
        if (document.queryCommandSupported('insertText')) {
          document.execCommand('insertText', false, variableText);
        } else {
          // 备选方案：手动处理插入
          fallbackInsert(variableText);
        }
      } catch {
        // 如果execCommand失败，使用备选方案
        fallbackInsert(variableText);
      }
    } else {
      window.$message?.warning('文本区域未找到，请重试');
    }
  };

  // markdown-to-jsx配置，用于自定义渲染
  const markdownOptions = {
    // 自定义渲染特定元素的行为
    overrides: {
      a: {
        component: ({ children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
          <a {...props}>{processTextNodes(children)}</a>
        )
      },
      blockquote: {
        component: ({ children, ...props }: React.BlockquoteHTMLAttributes<HTMLQuoteElement>) => (
          <blockquote {...props}>{processTextNodes(children)}</blockquote>
        )
      },
      em: {
        component: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
          <em {...props}>{processTextNodes(children)}</em>
        )
      },
      h1: {
        component: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
          <h1 {...props}>{processTextNodes(children)}</h1>
        )
      },
      h2: {
        component: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
          <h2 {...props}>{processTextNodes(children)}</h2>
        )
      },
      h3: {
        component: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
          <h3 {...props}>{processTextNodes(children)}</h3>
        )
      },
      h4: {
        component: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
          <h4 {...props}>{processTextNodes(children)}</h4>
        )
      },
      h5: {
        component: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
          <h5 {...props}>{processTextNodes(children)}</h5>
        )
      },
      h6: {
        component: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
          <h6 {...props}>{processTextNodes(children)}</h6>
        )
      },
      li: {
        component: ({ children, ...props }: React.LiHTMLAttributes<HTMLLIElement>) => (
          <li {...props}>{processTextNodes(children)}</li>
        )
      },
      // 处理所有可能包含文本的Markdown元素
      p: {
        component: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
          <p {...props}>{processTextNodes(children)}</p>
        )
      },
      span: {
        component: ({ children, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
          <span {...props}>{processTextNodes(children)}</span>
        )
      },
      strong: {
        component: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
          <strong {...props}>{processTextNodes(children)}</strong>
        )
      }
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-medium">{type === 'userAgreement' ? '用户协议' : '隐私政策'}内容编辑</h2>
        <AButton
          loading={saving}
          type="primary"
          onClick={handleSave}
        >
          保存
        </AButton>
      </div>

      <ASpin spinning={loading}>
        <div className="mb-4">
          <AAlert
            showIcon
            className="mb-4"
            message="提示"
            type="info"
            description={
              <div>
                您可以在此编辑内容，编辑完成后点击保存按钮将更改应用到系统中。
                <br />
                支持Markdown格式，您可以使用预设变量（如[[.ENTITY_NAME]]）来动态替换内容。
              </div>
            }
          />

          {/* 可用变量按钮区域 */}
          <div className="mb-4 rounded-md bg-gray-50 p-3">
            <div className="mb-2 text-gray-700 font-medium">可用变量：</div>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_VARIABLES.map(variable => (
                <ATooltip
                  key={variable.key}
                  title={variable.description}
                >
                  <AButton
                    className="bg-white"
                    size="small"
                    onClick={() => insertVariable(variable)}
                  >
                    {variable.name}
                  </AButton>
                </ATooltip>
              ))}
            </div>
          </div>

          {/* 编辑器与预览区域 */}
          <ARow gutter={16}>
            <ACol span={12}>
              <div className="mb-2 font-medium">编辑</div>
              <AInput.TextArea
                placeholder="请输入Markdown内容"
                ref={textAreaRef}
                rows={20}
                style={{ resize: 'none', width: '100%' }}
                value={content}
                onChange={e => setContent(e.target.value)}
                onSelect={() => {
                  // 在选择/点击文本时更新DOM元素，确保它与React状态同步
                  if (textAreaRef.current) {
                    textAreaRef.current.value = content;
                  }
                }}
              />
            </ACol>
            <ACol span={12}>
              <div className="mb-2 font-medium">预览</div>
              <div
                className="prose prose-sm h-full max-w-none overflow-auto border rounded-md p-4"
                style={{ minHeight: '362px' }}
              >
                {content ? (
                  <Markdown
                    className="content"
                    options={markdownOptions}
                  >
                    {content}
                  </Markdown>
                ) : (
                  <div className="text-gray-400">预览内容将显示在这里</div>
                )}
              </div>
            </ACol>
          </ARow>
        </div>
      </ASpin>
    </div>
  );
}
