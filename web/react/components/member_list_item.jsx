// Copyright (c) 2015 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

var UserStore = require('../stores/user_store.jsx');
const Utils = require('../utils/utils.jsx');

export default class MemberListItem extends React.Component {
    constructor(props) {
        super(props);

        this.handleInvite = this.handleInvite.bind(this);
        this.handleRemove = this.handleRemove.bind(this);
        this.handleMakeAdmin = this.handleMakeAdmin.bind(this);
    }
    handleInvite(e) {
        e.preventDefault();
        this.props.handleInvite(this.props.member.id);
    }
    handleRemove(e) {
        e.preventDefault();
        this.props.handleRemove(this.props.member.id);
    }
    handleMakeAdmin(e) {
        e.preventDefault();
        this.props.handleMakeAdmin(this.props.member.id);
    }
    render() {
        var member = this.props.member;
        var isAdmin = this.props.isAdmin;
        var isMemberAdmin = Utils.isAdmin(member.roles);
        var timestamp = UserStore.getCurrentUser().update_at;

        var invite;
        if (member.invited && this.props.handleInvite) {
            invite = <span className='member-role'>Added</span>;
        } else if (this.props.handleInvite) {
            invite = (
                    <a
                        onClick={this.handleInvite}
                        className='btn btn-sm btn-primary member-invite'
                    >
                        <i className='glyphicon glyphicon-envelope'/>
                        {' Add'}
                    </a>
            );
        } else if (isAdmin && !isMemberAdmin && (member.id !== UserStore.getCurrentId())) {
            var self = this;

            let makeAdminOption = null;
            if (this.props.handleMakeAdmin) {
                makeAdminOption = (
                                    <li role='presentation'>
                                        <a
                                            href=''
                                            role='menuitem'
                                            onClick={self.handleMakeAdmin}
                                        >
                                            Make Admin
                                        </a>
                                    </li>);
            }

            let handleRemoveOption = null;
            if (this.props.handleRemove) {
                handleRemoveOption = (
                                        <li role='presentation'>
                                            <a
                                                href=''
                                                role='menuitem'
                                                onClick={self.handleRemove}
                                            >
                                                Remove Member
                                            </a>
                                        </li>);
            }

            invite = (
                        <div className='dropdown member-drop'>
                            <a
                                href='#'
                                className='dropdown-toggle theme'
                                type='button'
                                id='channel_header_dropdown'
                                data-toggle='dropdown'
                                aria-expanded='true'
                            >
                                <span className='text-capitalize'>{member.roles || 'Member'} </span>
                                <span className='caret'></span>
                            </a>
                            <ul
                                className='dropdown-menu member-menu'
                                role='menu'
                                aria-labelledby='channel_header_dropdown'
                            >
                                {makeAdminOption}
                                {handleRemoveOption}
                            </ul>
                        </div>
                    );
        } else {
            invite = <div className='member-role text-capitalize'>{member.roles || 'Member'}<span className='caret hidden'></span></div>;
        }

        return (
            <div className='row member-div'>
                <img
                    className='post-profile-img pull-left'
                    src={'/api/v1/users/' + member.id + '/image?time=' + timestamp + '&' + Utils.getSessionIndex()}
                    height='36'
                    width='36'
                />
                <span className='member-name'>{Utils.getDisplayName(member)}</span>
                <span className='member-email'>{member.email}</span>
                {invite}
            </div>
        );
    }
}

MemberListItem.propTypes = {
    handleInvite: React.PropTypes.func,
    handleRemove: React.PropTypes.func,
    handleMakeAdmin: React.PropTypes.func,
    member: React.PropTypes.object,
    isAdmin: React.PropTypes.bool
};
