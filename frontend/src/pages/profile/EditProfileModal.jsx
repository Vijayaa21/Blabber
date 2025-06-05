import { useState } from "react";

const EditProfileModal = () => {
	const [formData, setFormData] = useState({
		fullName: "",
		username: "",
		email: "",
		bio: "",
		link: "",
		newPassword: "",
		currentPassword: "",
	});

	const handleInputChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	return (
		<>
			<button
  className="btn btn-outline rounded-full btn-sm"
  onClick={() => document.getElementById("edit_profile_modal").showModal()}
>
  Edit profile
</button>

<dialog id="edit_profile_modal" className="modal">
  <div
    className="modal-box max-w-2xl w-full p-8 rounded-2xl shadow-lg relative"
    style={{
      background: "linear-gradient(to bottom right, #1E1E2F, #2A2A40)",
      color: "#ffffff",
    }}
  >
    {/* Close Button */}
    <button
      onClick={() => document.getElementById("edit_profile_modal").close()}
      className="absolute top-4 right-4 text-white hover:text-red-400 text-xl"
    >
      ❌
    </button>

    <h3 className="text-2xl font-bold text-center mb-6">Update Profile</h3>

    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        alert("Profile updated successfully");
        document.getElementById("edit_profile_modal").close();
      }}
    >
      {/* Row 1 */}
      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          className="input input-bordered w-full p-3 rounded-md bg-[#2A2A40] text-white placeholder-gray-400 border border-gray-600"
          value={formData.fullName}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="username"
          placeholder="Username"
          className="input input-bordered w-full p-3 rounded-md bg-[#2A2A40] text-white placeholder-gray-400 border border-gray-600"
          value={formData.username}
          onChange={handleInputChange}
        />
      </div>

      {/* Row 2 */}
      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="input input-bordered w-full p-3 rounded-md bg-[#2A2A40] text-white placeholder-gray-400 border border-gray-600"
          value={formData.email}
          onChange={handleInputChange}
        />
        <textarea
          name="bio"
          placeholder="Bio"
          className="textarea textarea-bordered w-full p-3 rounded-md bg-[#2A2A40] text-white placeholder-gray-400 border border-gray-600"
          value={formData.bio}
          onChange={handleInputChange}
        />
      </div>

      {/* Row 3 */}
      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="password"
          name="currentPassword"
          placeholder="Current Password"
          className="input input-bordered w-full p-3 rounded-md bg-[#2A2A40] text-white placeholder-gray-400 border border-gray-600"
          value={formData.currentPassword}
          onChange={handleInputChange}
        />
        <input
          type="password"
          name="newPassword"
          placeholder="New Password"
          className="input input-bordered w-full p-3 rounded-md bg-[#2A2A40] text-white placeholder-gray-400 border border-gray-600"
          value={formData.newPassword}
          onChange={handleInputChange}
        />
      </div>

      {/* Row 4 */}
      <input
        type="text"
        name="link"
        placeholder="Link"
        className="input input-bordered w-full p-3 rounded-md bg-[#2A2A40] text-white placeholder-gray-400 border border-gray-600"
        value={formData.link}
        onChange={handleInputChange}
      />

      <button
        type="submit"
        className="btn bg-purple-600 hover:bg-purple-700 text-white rounded-full px-5 m-4 self-center"
      >
        Update
      </button>
    </form>
  </div>

  {/* Backdrop */}
  <form method="dialog" className="modal-backdrop bg-black/50">
    <button className="w-full h-full cursor-default" />
  </form>
</dialog>


		</>
	);
};
export default EditProfileModal;