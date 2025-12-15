const PostSkeleton = () => {
	return (
		<div className='bg-slate-900/40 border border-white/5 rounded-3xl p-4 animate-pulse break-inside-avoid mb-5'>
			<div className='flex gap-3 items-center'>
				<div className='w-10 h-10 rounded-full bg-slate-700/50 shrink-0'></div>
				<div className='flex flex-col gap-2 flex-1'>
					<div className='h-3 w-24 rounded-full bg-slate-700/50'></div>
					<div className='h-2 w-16 rounded-full bg-slate-700/50'></div>
				</div>
			</div>
			<div className='mt-3 space-y-2'>
				<div className='h-3 w-full rounded-full bg-slate-700/50'></div>
				<div className='h-3 w-3/4 rounded-full bg-slate-700/50'></div>
			</div>
			<div className='mt-3 pt-3 border-t border-white/5 flex justify-between'>
				<div className='h-6 w-12 rounded-full bg-slate-700/50'></div>
				<div className='h-6 w-12 rounded-full bg-slate-700/50'></div>
				<div className='h-6 w-12 rounded-full bg-slate-700/50'></div>
				<div className='h-6 w-12 rounded-full bg-slate-700/50'></div>
			</div>
		</div>
	);
};
export default PostSkeleton;