import React from "react";

const UserListModal = ({ isOpen, onClose, title, users }) => {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
			<div className="bg-white rounded-lg w-96 max-h-[80vh] overflow-y-auto shadow-lg">
				<div className="p-4 border-b font-semibold text-lg flex justify-between">
					{title}
					<button onClick={onClose}>✖</button>
				</div>
				<div className="p-4">
					{users.length === 0 ? (
						<p className="text-gray-500 text-center">No users found.</p>
					) : (
						users.map((user) => (
							<div key={user._id} className="flex items-center gap-3 mb-3">
								<img src={user.profileImg} alt="Profile" className="w-10 h-10 rounded-full" />
								<div>
									<p className="font-medium">{user.fullName}</p>
									<p className="text-sm text-gray-500">@{user.username}</p>
								</div>
							</div>
						))
					)}
				</div>
			</div>
		</div>
	);
};

export default UserListModal;