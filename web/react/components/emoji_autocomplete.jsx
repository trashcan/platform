// Copyright (c) 2015 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.


import Constants from '../utils/constants.jsx';
const KeyCodes = Constants.KeyCodes;
const Popover = ReactBootstrap.Popover;
import * as Utils from '../utils/utils.jsx';
import * as Emoticons from '../utils/emoticons.jsx';

const patterns = new Map([
    ['emoji', /:(\w+)/i]
]);

const emojiList = [ "ice_cream", "happy" ];

var MAX_HEIGHT_LIST = 292;
var MAX_ITEMS_IN_LIST = 25;
var ITEM_HEIGHT = 36;

export default class EmojiAutocomplete extends React.Component {
    constructor(props) {
        super(props);

        this.handleClick = this.handleClick.bind(this);
        this.handleDocumentClick = this.handleDocumentClick.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);

        this.completeWord = this.completeWord.bind(this);
        this.getSelection = this.getSelection.bind(this);
        this.scrollToItem = this.scrollToItem.bind(this);
        this.updateSuggestions = this.updateSuggestions.bind(this);

        this.renderEmojiSuggestion = this.renderEmojiSuggestion.bind(this);

        this.state = {
            show: false,
            mode: '',
            filter: '',
            selection: 0,
            suggestions: []
        };
    }

    componentDidMount() {
        $(document).on('click', this.handleDocumentClick);
    }

    componentDidUpdate(prevProps, prevState) {
        const content = $(ReactDOM.findDOMNode(this.refs.emojiPopover)).find('.popover-content');

        if (this.state.show && this.state.suggestions.length > 0) {
            if (!prevState.show) {
                content.perfectScrollbar();
                content.css('max-height', $(window).height() - 200);
            }

            // keep the keyboard selection visible when scrolling
            this.scrollToItem(this.getSelection());
        }
    }

    componentWillUnmount() {
        $(document).off('click', this.handleDocumentClick);
    }

    handleClick(value) {
        this.completeWord(value);
    }

    handleDocumentClick(e) {
        const container = $(ReactDOM.findDOMNode(this.refs.emojiPopover));

        if (!(container.is(e.target) || container.has(e.target).length > 0)) {
            this.setState({
                show: false
            });
        }
    }

    handleInputChange(textbox, text) {
        console.log("ac: handleInputChange: " + text);
        const caret = Utils.getCaretPosition(textbox);
        const preText = text.substring(0, caret);

        let mode = '';
        let filter = '';
        
        for (const [modeForPattern, pattern] of patterns) {
            const result = pattern.exec(preText);

            if (result) {
                mode = modeForPattern;
                filter = result[1];
                break;
            }
        }

        if (mode !== this.state.mode || filter !== this.state.filter) {
            this.updateSuggestions(mode, filter);
        }

        this.setState({
            mode,
            filter,
            show: mode || filter
        });
    }

    handleKeyDown(e) {
        if (!this.state.show || this.state.suggestions.length === 0) {
            return;
        }

        if (e.which === KeyCodes.UP || e.which === KeyCodes.DOWN) {
            e.preventDefault();

            let selection = this.state.selection;

            if (e.which === KeyCodes.UP) {
                selection -= 1;
            } else {
                selection += 1;
            }

            if (selection >= 0 && selection < this.state.suggestions.length) {
                this.setState({
                    selection
                });
            }
        } else if (e.which === KeyCodes.ENTER || e.which === KeyCodes.SPACE) {
            e.preventDefault();

            this.completeWord(this.getSelection());
        }
    }

    completeWord(value) {
        // add a space so that anything else typed doesn't interfere with the search flag
        this.props.completeWord(this.state.filter, value + ' ');

        this.setState({
            show: false,
            mode: '',
            filter: '',
            selection: 0
        });
    }

    getSelection() {
        if (this.state.suggestions.length > 0) {
        // TODO:
        /*    if (this.state.mode === 'channels') {
                return this.state.suggestions[this.state.selection].name;
            } else if (this.state.mode === 'users') {
                return this.state.suggestions[this.state.selection].username;
            }*/
        }

        return '';
    }

    scrollToItem(itemName) {
        const content = $(ReactDOM.findDOMNode(this.refs.emojiPopover)).find('.popover-content');
        const visibleContentHeight = content[0].clientHeight;
        const actualContentHeight = content[0].scrollHeight;

        if (this.state.suggestions.length > 0 && visibleContentHeight < actualContentHeight) {
            const contentTop = content.scrollTop();
            const contentTopPadding = parseInt(content.css('padding-top'), 10);
            const contentBottomPadding = parseInt(content.css('padding-top'), 10);

            const item = $(this.refs[itemName]);
            const itemTop = item[0].offsetTop - parseInt(item.css('margin-top'), 10);
            const itemBottom = item[0].offsetTop + item.height() + parseInt(item.css('margin-bottom'), 10);

            if (itemTop - contentTopPadding < contentTop) {
                // the item is off the top of the visible space
                content.scrollTop(itemTop - contentTopPadding);
            } else if (itemBottom + contentTopPadding + contentBottomPadding > contentTop + visibleContentHeight) {
                // the item has gone off the bottom of the visible space
                content.scrollTop(itemBottom - visibleContentHeight + contentTopPadding + contentBottomPadding);
            }
        }
    }

    updateSuggestions(mode, filter) {        
        let suggestions = [];  
        let results = Emoticons.search(filter);
        
        for (let i = 0; i < results.length; i++) {
            let emoticon = results[i];
            suggestions.push({'key': emoticon,
                ref: ':' + emoticon + ':',
                name: ':' + emoticon + ':',
                href: '/static/images/emoji/' + emoticon + '.png'
            });      
        }
         
        // TODO: need an Emoticons.search("prefix"), these are just examples.
        /*suggestions.push({'key': 'alien',
            ref: ':alien:',
            name: ':alien:',
            href: '/static/images/emoji/alien.png'
        }); 
        
        suggestions.push({'key': 'ice_cream',
            ref: 'ice_cream',
            name: ':ice_cream:',
            href: '/static/images/emoji/ice_cream.png'
        });    

        suggestions.push({'key': 'thumbsup',
            ref: ':thumbsup:',
            name: ':thumbsup:',
            href: '/static/images/emoji/thumbsup.png'
        }); */
    
        let selection = this.state.selection;

        // keep the same user/channel selected if it's still visible as a suggestion
        if (selection > 0 && this.state.suggestions.length > 0) {
            // we can't just use indexOf to find if the selection is still in the list since they are different javascript objects
            const currentSelectionId = this.state.suggestions[selection].id;
            let found = false;

            for (let i = 0; i < suggestions.length; i++) {
                if (suggestions[i].id === currentSelectionId) {
                    selection = i;
                    found = true;

                    break;
                }
            }

            if (!found) {
                selection = 0;
            }
        } else {
            selection = 0;
        }

        this.setState({
            suggestions,
            selection
        });
    }

    renderEmojiSuggestion(emoji) {
        let className = 'search-autocomplete__item';
        /*if (user.username === this.getSelection()) {
            className += ' selected';
        }*/
        // TODO: onclick
        return (
            <div
                key={emoji.key}
                ref={emoji.ref}
                className={className + " mentions-name"}
            >
                <img
                    className='emoji'
                    src={emoji.href}
                />&nbsp;
                {emoji.name}
            </div>
        );
    }
    

    render() {
        if (!this.state.show || this.state.suggestions.length === 0) {
            return null;
        }

        let suggestions = [];
        
        console.log(this.state.suggestions);
        suggestions = this.state.suggestions.map(this.renderEmojiSuggestion);
       
        // TODO: this needs some fixing
        var $postbox = $('#post_textbox');        
        var maxHeight = MAX_HEIGHT_LIST;
        var style = {
            height: Math.min(maxHeight, (suggestions.length * ITEM_HEIGHT) + 4),
            width: $postbox.parent().width(),
            bottom:  $(window).height() - $postbox.offset().top - ITEM_HEIGHT,
            //left: $postbox.offset().left
        };
        
        return(
            <div
                className='mentions--top'
                style={style}
            >
                <div
                    ref='emojiPopover'
                    className='mentions-box'
                    id='emoji-autocomplete__popover'
                >
                    {suggestions}
                </div>
            </div>
          );
    }
}

EmojiAutocomplete.propTypes = {
    completeWord: React.PropTypes.func.isRequired
};
