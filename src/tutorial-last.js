// tutorial20.js
// NOTE: JSXの子要素内のコメントは { /*  */ } という形式にする
//       https://facebook.github.io/react/docs/jsx-in-depth.html#comments
var CommentBox = React.createClass({
  // NOTE: 普通のfetch関数
  loadCommentsFromServer: function() {
    $.ajax({
      // NOTE: React.render実行時に与えられる
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        // NOTE: this.setState
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this) // NOTE: this.propsを参照するためにbind?
    });
  },
  // NOTE: 普通のイベントハンドラ
  // NOTE: CommentFormコンポーネントが発火するイベントで新しいコメントが1引数で渡ってくる
  handleCommentSubmit: function(comment) {
    // NOTE: 先に新しいコメントを既存のコメントにマージしてstateにセットする最適化らしい
    // NOTE: POST前にレンダリングができるということ?
    var comments = this.state.data;
    var newComments = comments.concat([comment]);
    this.setState({data: newComments});
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: comment,
      success: function(data) {
        // POSTが返ってきたあとに再度レンダリングしそうだけどVirtualDOMだから問題ない?
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  // NOTE: 初期化時に1度だけ呼ばれる
  getInitialState: function() {
    return {data: []};
  },
  // NOTE: コンポーネントがレンダリングされた時に呼ばれる
  componentDidMount: function() {
    // NOTE: 初回fetch
    this.loadCommentsFromServer();
    // NOTE: 以降pollIntervalごとにfetch
    setInterval(this.loadCommentsFromServer, this.props.pollInterval);
  },
  render: function() {
    return (
      <div className="commentBox">
        { /* NOTE: JSXの中に通常のHTMLが書ける */ }
        { /* NOTE: 生DOMは小文字始まり */ }
        <h1>Comments</h1>
        { /* NOTE: JSXの中に他のJSXのコンポーネントが書ける */ }
        { /* NOTE: JSXコンポーネントはアッパーキャメルケース */ }
        { /* NOTE: data属性はthis.props.dataで参照できる */ }
        <CommentList data={this.state.data} />
        { /* NOTE: onCommentSubmitはこのコンポーネントが発火するイベント */ }
        <CommentForm onCommentSubmit={this.handleCommentSubmit} />
      </div>
    );
  }
});

// tutorial18.js
var CommentForm = React.createClass({
  // NOTE: 普通のイベントハンドラだがReactのAPIが使える
  handleSubmit: function(e) {
    e.preventDefault();
    // NOTE: React.findDOMNodeは生のDOMを返す(selectorとか使えるのか?)
    // NOTE: this.refs.*** はJSXでref属性で指定されているもの
    var author = React.findDOMNode(this.refs.author).value.trim();
    var text = React.findDOMNode(this.refs.text).value.trim();
    if (!text || !author) {
      return;
    }
    // NOTE: 親に対するイベントを発火できる
    this.props.onCommentSubmit({author: author, text: text});
    // NOTE: DOMキャッシュした方が良いのでは?何か理由あるのか?
    React.findDOMNode(this.refs.author).value = '';
    React.findDOMNode(this.refs.text).value = '';
    return;
  },
  render: function() {
    return (
      // NOTE: onSubmitでイベントハンドラを指定(要キャメルケース)
      <form className="commentForm" onSubmit={this.handleSubmit}>
        { /* NOTE: JSコードから参照するにはref属性を付ける */ }
        <input type="text" placeholder="Your name" ref="author" />
        <input type="text" placeholder="Say something..." ref="text" />
        <input type="submit" value="Post" />
      </form>
    );
  }
});

// tutorial10.js
var CommentList = React.createClass({
  render: function() {
    // NOTE: returnの箇所以外でもJSXは使える
    // NOTE: this.props.dataは親のCommentBoxから与えられる
    var commentNodes = this.props.data.map(function (comment) {
      return (
        <Comment author={comment.author}>
          {comment.text}
        </Comment>
      );
    });
    // NOTE: renderのreturnにJSXの変換結果を入れ子にできる
    return (
      <div className="commentList">
        {commentNodes}
      </div>
    );
  }
});

// tutorial7.js
var Comment = React.createClass({
  // NOTE: RactのClassのrenderはJSXの変換結果=View?を返す
  render: function() {
    // NOTE: this.props.childrenがtextNode??
    var rawMarkup = marked(this.props.children.toString(), {sanitize: true});
    return (
      <div className="comment">
        <h2 className="commentAuthor">
          { /* NOTE: this.props.authorは親のCommentListから名前付きで与えられている */ }
          {this.props.author}
        </h2>
        <span dangerouslySetInnerHTML={{__html: rawMarkup}} />
      </div>
    );
  }
});

// NOTE: 最終的な呼び出し
// NOTE: 具体的な引数を属性で与えている
// NOTE: React.renderの第1引数がJSXの結果
// NOTE: React.renderの第2引数がJSXの結果を適用する生DOM
React.render(
  <CommentBox url="comments.json" pollInterval={2000} />,
  document.getElementById('content')
);

